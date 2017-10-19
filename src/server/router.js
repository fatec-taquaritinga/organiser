import 'babel-polyfill'
import url from 'url'
import debug from '../debug'
import { resolveRequestArguments } from '../injections'
import { generateRouteMatcher, extractHeaders } from './utils'
import { Response } from '../response'
import ModulesChain from './modules'
import utils from '../utils'
import Exceptions from '../exceptions'
import { retrieve as retrievePersistence, resolveArgumentsInjection } from '../persistence'

export default class Router {
  constructor (server) {
    this._server = server
    this._modules = Object.seal({
      before: new ModulesChain(),
      after: new ModulesChain()
    })
    this._onEndpointNotFound = (input, request) => Response.notFound().build()
    this._onException = (exception) => Response.serverError(exception).build()
    this._onStrictException = (property) => Response.badRequest({ exception: Exceptions.STRICT_MODE.name, message: `${property} is missing.` }).build()
  }

  modules (...modules) {
    const that = this
    const len = modules.length
    if (len === 0) {
      return {
        after (...modules) {
          for (let mod of modules) that._modules.after.register(mod)
        },
        before (...modules) {
          for (let mod of modules) that._modules.before.register(mod)
        }
      }
    } else if (len === 1 && Array.isArray(modules[0])) {
      modules = modules[0]
    }
    for (let mod of modules) that._modules.before.register(mod)
    return {
      after (...modules) {
        for (let mod of modules) that._modules.after.register(mod)
      }
    }
  }

  retrieveRoute (httpMethod, url) {
    let response = null
    const routes = this[httpMethod]
    if (routes) {
      utils.iterate(routes, (route) => {
        if (route.matcher.test(url)) {
          response = route
          return true
        }
      })
    }
    return response
  }

  resolveRoute (context) {
    const request = context.request
    const parsed = url.parse(request.url, true)
    let input = parsed.pathname.replace(/\/{2,}/g, '/')
    context.route = this.retrieveRoute(request.method, input)
    if (context.route) {
      context.headers = extractHeaders(context.request)
      context.url = {
        parsed,
        input
      }
      this.resolveModulesBefore(context)
    } else {
      this._end(context.response, this._onEndpointNotFound())
    }
  }

  async resolveModulesBefore (context) {
    if (!(context.expectedResponse = await this._modules.before.execute(context))) context.expectedResponse = await context.route.modules.before.execute(context)
    this.resolveRequest(context)
  }

  async resolveRequest (context) {
    /*
    resolveRequestArguments(context).then((args) => {
      if (args instanceof Exceptions.STRICT_MODE) {
        return this._onStrictException(args.message)
      } else if (response) {
        return response
      } else {
        const resolver = context.route.resolver
        return resolver.controller[resolver.method](args)
      }
    }).then((response) => {
      if (!(response instanceof Response)) throw new Error('Response call must return a Response object!')
      return this._end(context.response, response)
    }).then(() => {
      if (!this._server.options.internal.debug) return
      const diff = process.hrtime(context.timing)
      debug.log.info(`(${context.request.method}): ${context.url.input}`)
      debug.log.info(`Request processed in ${diff[0]}s ${diff[1] / 1000000}ms.`)
    })
    */
    let response = context.expectedResponse
    if (!response) {
      const args = await resolveRequestArguments(context)
      if (args instanceof Exceptions.STRICT_MODE) {
        response = this._onStrictException(args.message)
      } else if (!response) {
        const resolver = context.route.resolver
        context.expectedResponse = await resolver.controller[resolver.method](args)
        const controllerMods = await context.route.modules.after.execute(context)
        if (controllerMods) context.expectedResponse = controllerMods
        response = await this._modules.after.execute(context) || context.expectedResponse
      }
    }
    if (!(response instanceof Response)) throw new Error('Response call must return a Response object!')
    await this._end(context.response, response)
    if (!this._server.options.internal.debug) return
    const diff = process.hrtime(context.timing)
    debug.log.info(`(${context.request.method}): ${context.url.input}`)
    debug.log.info(`Request processed in ${diff[0]}s ${diff[1] / 1000000}ms.`)
  }

  register (...endpoints) {
    if (endpoints.length === 1 && Array.isArray(endpoints[0])) endpoints = endpoints[0]
    let response = []
    for (let controller of endpoints) {
      if (Array.isArray(controller)) {
        for (let child of controller) response.push(...this._register(child))
      } else {
        response.push(...this._register(controller))
      }
    }
    return response
  }

  _end (connection, response) {
    return new Promise(resolve => {
      connection.writeHead(response.body.status, response.header)
      const body = response.body.entity
      if (body) {
        connection.end(typeof body === 'object' ? JSON.stringify(body) : body, response.body.encoding, resolve)
      } else {
        connection.end(null, 'utf8', resolve)
      }
    })
  }

  _register (endpoint) {
    const endpointType = typeof endpoint
    let instance
    if (endpointType === 'function') {
      try {
        instance = new (endpoint.bind.apply(endpoint, [endpoint, ...resolveArgumentsInjection(endpoint)]))() // eslint-disable-line no-useless-call
      } catch (exception) {
        instance = endpoint()
      }
    } else if (endpoint && endpointType === 'object') {
      instance = endpoint
    } else {
      throw new Exceptions.UNEXPECTED_VALUE(`Endpoint must be a class, function or object. Found: ${endpoint}`)
    }
    const endpointPersistence = retrievePersistence(endpoint)
    const persistence = retrievePersistence(instance)
    const response = []
    utils.iterate(Object.keys(persistence), (functionName) => {
      const method = persistence[functionName]
      const endpointMods = endpointPersistence.modules
      const methodMods = method.modules
      utils.iterate(method.types, (httpMethod) => {
        const routes = this[httpMethod] || (this[httpMethod] = [])
        const {path, matcher} = generateRouteMatcher(endpointPersistence.path || '/', method.path || '/')
        const route = Object.freeze({
          path,
          matcher,
          modules: Object.freeze({
            after: new ModulesChain(endpointMods ? endpointMods.after : null, methodMods ? methodMods.after : null),
            before: new ModulesChain(endpointMods ? endpointMods.before : null, methodMods ? methodMods.before : null)
          }),
          resolver: Object.freeze({
            controller: instance,
            persistence,
            method: functionName
          })
        })
        routes.push(route)
        response.push(route)
      })
    })
    return response
  }
}
