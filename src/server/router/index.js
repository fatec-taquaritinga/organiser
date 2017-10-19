import 'babel-polyfill'
import url from 'url'
import debug from '../../debug'
import { resolveRequestArguments } from '../../injections'
import { generateRouteMatcher, extractHeaders } from '../utils'
import { Response } from '../../response'
import ModulesChain from '../modules'
import utils from '../../utils'
import Exceptions from '../../exceptions'
import { retrieve as retrievePersistence, resolveArgumentsInjection } from '../../persistence'

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

  async retrieveRoute (httpMethod, url) {
    return new Promise((resolve) => {
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
      resolve(response)
    })
  }

  async resolveRoute (context) {
    const ctxRequest = context.request
    const ctxResponse = context.response
    const parsed = url.parse(ctxRequest.url, true)
    let input = parsed.pathname.replace(/\/{2,}/g, '/')
    context.headers = await extractHeaders(ctxRequest)
    context.url = {
      parsed,
      input
    }
    const serverBefore = await this._modules.before.execute(context)
    if (serverBefore === undefined) {
      const route = await this.retrieveRoute(ctxRequest.method, input)
      if (route) {
        context.route = route
        const controllerBefore = await route.modules.before.execute(context)
        if (controllerBefore === undefined) {
          const args = await resolveRequestArguments(context)
          const resolver = route.resolver
          context.expectedResponse = await resolver.controller[resolver.method](args)
          // from now on, returning a response on a module doesn't make it final
          const controllerAfter = await route.modules.after.execute(context)
          if (controllerAfter) context.expectedResponse = controllerAfter
          const serverAfter = await this._modules.after.execute(context)
          if (serverAfter) context.expectedResponse = serverAfter
          await this._end(ctxResponse, context.expectedResponse)
          if (!this._server.options.internal.debug) return
          const diff = process.hrtime(context.timing)
          debug.log.info(`(${ctxRequest.method}): ${context.url.input}`)
          debug.log.info(`Request processed in ${diff[0]}s ${diff[1] / 1000000}ms.`)
        } else {
          await this._end(ctxResponse, controllerBefore)
          if (!this._server.options.internal.debug) return
          const diff = process.hrtime(context.timing)
          debug.log.info(`(${ctxRequest.method}): ${context.url.input}`)
          debug.log.info(`Request processed in ${diff[0]}s ${diff[1] / 1000000}ms.`)
        }
      } else {
        await this._end(ctxResponse, this._onEndpointNotFound())
        if (!this._server.options.internal.debug) return
        const diff = process.hrtime(context.timing)
        debug.log.info(`(${context.request.method}): ${context.url.input}`)
        debug.log.info(`Request processed in ${diff[0]}s ${diff[1] / 1000000}ms.`)
      }
    } else {
      await this._end(ctxResponse, serverBefore)
      if (!this._server.options.internal.debug) return
      const diff = process.hrtime(context.timing)
      debug.log.info(`(${context.request.method}): ${context.url.input}`)
      debug.log.info(`Request processed in ${diff[0]}s ${diff[1] / 1000000}ms.`)
    }
  }

  _end (connection, response) {
    return new Promise(async (resolve) => {
      if (!(response instanceof Response)) throw new Error('Response call must return a Response object!')
      const entity = response.body.entity
      if (typeof entity === 'function') {
        response = await entity(response)
        if (!(response instanceof Response)) throw new Error('Response call must return a Response object!')
      }
      const body = response.body.entity
      connection.writeHead(response.body.status, response.header)
      if (body) {
        connection.end(typeof body === 'object' ? JSON.stringify(body) : body, response.body.encoding, resolve)
      } else {
        connection.end(null, 'utf8', resolve)
      }
    })
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
