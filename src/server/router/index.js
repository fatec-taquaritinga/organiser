import 'babel-polyfill'
import { Response } from '../../response'
import { UnexpectedValueException } from '../../exceptions'
import { retrieve as retrievePersistence, resolveArgumentsInjection } from '../../persistence'
import { RouterStorage } from './storage'
import { createFlowModifiers } from '../flow/modifier'
import { iterate } from '../../utils'

function generatePath (prefix, path) {
  return (path === '/' ? `/${prefix}` : `/${prefix}/${path}`).replace(/\/+/g, '/')
}

export class Router {
  constructor () {
    this._modules = createFlowModifiers()
    this._storage = new RouterStorage()
    this.onEndpointNotFound = (input, request) => Response.notFound().build()
    this.onException = (exception) => Response.serverError(exception).build()
  }

  modules (...modules) {
    const mods = this._modules
    const len = modules.length
    if (len === 0) {
      return {
        after (...modules) {
          mods.after.push(...modules)
        },
        before (...modules) {
          mods.before.push(...modules)
        }
      }
    } else if (len === 1 && Array.isArray(modules[0])) {
      modules = modules[0]
    }
    mods.before.push(...modules)
    return {
      after (...modules) {
        mods.after.push(...modules)
      }
    }
  }

  async terminate (response, object, onEnd) {
    if (!(object instanceof Response)) {
      throw new UnexpectedValueException('Response call must return a Response object!')
    }
    const entity = object.body.entity
    if (typeof entity === 'function') {
      this.terminate(response, await entity(response), onEnd)
    } else {
      setImmediate(this._handleEnd, response, object.body.status, object.header, entity, object.body.encoding, onEnd)
    }
  }

  _handleEnd (response, status, header, object, encoding, onEnd) {
    response.writeHead(status, header)
    response.end(typeof object === 'object' ? JSON.stringify(object) : object, encoding || 'utf8', onEnd)
  }

  register (...endpoints) {
    if (endpoints.length === 1 && Array.isArray(endpoints[0])) endpoints = endpoints[0]
    let response = []
    iterate(endpoints, (controller) => {
      if (Array.isArray(controller)) {
        iterate(controller, (child) => {
          response.push(...this._loadInstance(child))
        })
      } else {
        response.push(...this._loadInstance(controller))
      }
    })
    return response
  }

  find (path, method) {
    return this._storage.find(path, method)
  }

  _loadInstance (endpoint) {
    const self = this
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
      throw new UnexpectedValueException(`Endpoint must be a class, function or object. Found: ${endpoint}`)
    }
    const endpointPersistence = retrievePersistence(endpoint)
    const persistence = retrievePersistence(instance)
    const response = []
    iterate(Object.keys(persistence), (functionName) => {
      const method = persistence[functionName]
      const endpointMods = endpointPersistence.modules
      const methodMods = method.modules
      iterate(method.types, (httpMethod) => {
        const path = generatePath(endpointPersistence.path || '/', method.path || '/')
        const data = Object.freeze({
          path,
          method: httpMethod,
          modules: createFlowModifiers([...(endpointMods ? endpointMods.after : []), ...(methodMods ? methodMods.after : [])], [...(endpointMods ? endpointMods.before : []), ...(methodMods ? methodMods.before : [])]),
          resolver: Object.freeze({
            controller: instance,
            persistence,
            method: functionName
          })
        })
        self._storage.register(path, httpMethod, data)
        response.push(data)
      })
    })
    return response
  }
}
