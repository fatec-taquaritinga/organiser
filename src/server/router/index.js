import 'babel-polyfill'
import { Response } from '../../response'
import { UnexpectedValueException } from '../../exceptions'
import { retrieve as retrievePersistence, resolveArgumentsInjection } from '../../persistence'
import { StaticRoutes, RouteNode, generatePath } from './structures'
import { createFlowModifiers } from '../flow/modifier'
import { iterate } from '../../utils'

const parametersRegex = /\{(\S+?)\}|\*+/
const wildcardRegex = /(\(+)(\*{1,2})(\)+)/

function joinRemainingSections (sections, index, response) {
  const current = index + 1
  const section = sections[current]
  if (section) return joinRemainingSections(sections, current, `${response}/${section}`)
  return response
}

function translateWildcard (value) {
  if (!value || value === '*') {
    return '([^\\s\\/]+)'
  } else if (value === '**') {
    return '([^\\s]+)'
  }
  return value
}

function sanitizeArgument (argument) {
  return argument ? argument.replace(wildcardRegex, '$2') : null
}

function parseSegment (path, params, isGlobal) {
  if (!params) {
    const params = []
    const parsed = parseSegment(path, params, false)
    return params.length === 0 ? null : {
      matcher: new RegExp(`^${parsed.path}$`),
      params,
      isGlobal: parsed.isGlobal
    }
  } else if (isGlobal) {
    return { path, isGlobal }
  } else {
    const match = parametersRegex.exec(path)
    if (match) {
      const segment = match[0]
      const args = (match[1] || segment).split('=', 2)
      const name = args[0]
      const matcherValue = sanitizeArgument(args[1]) || (name === '**' ? '**' : '*')
      params.push(name)
      return parseSegment(path.replace(segment, translateWildcard(matcherValue)), params, matcherValue === '**')
    } else {
      return { path, isGlobal }
    }
  }
}

export class Router {
  constructor () {
    this._modules = createFlowModifiers()
    this._root = new RouteNode()
    this._static = new StaticRoutes()
    this.onEndpointNotFound = (input, request) => Response.notFound().build()
    this.onException = (exception) => Response.serverError(exception).build()
  }

  modules (...modules) {
    const that = this
    const len = modules.length
    if (len === 0) {
      return {
        after (...modules) {
          that._modules.after.push(...modules)
        },
        before (...modules) {
          that._modules.before.push(...modules)
        }
      }
    } else if (len === 1 && Array.isArray(modules[0])) {
      modules = modules[0]
    }
    that._modules.before.push(...modules)
    return {
      after (...modules) {
        that._modules.after.push(...modules)
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
      setImmediate(this._handleEnd, response, object.body.status, object.header, entity, object.body.encoding || 'utf8', onEnd)
    }
  }

  _handleEnd (response, status, header, object, encoding, onEnd) {
    response.writeHead(status, header)
    response.end(typeof object === 'object' ? JSON.stringify(object) : object, encoding, onEnd)
  }

  register (...endpoints) {
    if (endpoints.length === 1 && Array.isArray(endpoints[0])) endpoints = endpoints[0]
    let response = []
    for (let controller of endpoints) {
      if (Array.isArray(controller)) {
        for (let child of controller) response.push(...this._loadInstance(child))
      } else {
        response.push(...this._loadInstance(controller))
      }
    }
    return response
  }

  _register (path, method, data) {
    if (path[0] !== '/') path = `/${path}`
    if (path[path.length - 1] === '/') path = path.slice(0, -1)
    if (parametersRegex.test(path)) {
      const sections = path.replace(/\/+/g, '/').replace(/\|+/g, '|').split('/')
      let node = this._root
      let section
      let index = 0
      while ((section = sections[++index])) {
        const segment = parseSegment(section)
        node = segment ? node.setAfter(segment) : node.child(section)
        if (segment && segment.isGlobal) break
      }
      node.data(method, data)
      console.log(`(${method}) dynamic registered: ${path}`)
    } else {
      this._static.set(path, method, data)
      console.log(`(${method}) static registered: ${path}`)
    }
  }

  find (path, method) {
    if (path[path.length - 1] === '/') path = path.slice(0, -1)
    const cached = this._static.get(path, method)
    if (cached) return cached
    let sections = path.split('/')
    const params = {}
    let index = 0
    let lastNode = this._root
    while (true) {
      const section = sections[++index]
      const node = lastNode._hasAfter ? lastNode._after : lastNode.retrieveChild(section)
      if (section && node) {
        if (node._hasParamaters) {
          const content = node._content
          let args = content.matcher.exec(section)
          if (args) {
            const names = content.params
            if (content.isGlobal) {
              for (let i = 0, j = names.length; i < j; ++i) {
                const l = i + 1
                const name = names[i]
                if (name && name[0] !== '*') params[name] = l === j ? joinRemainingSections(sections, index, args[l]) : args[l]
              }
              lastNode = node
              break
            } else {
              for (let i = 0, j = names.length; i < j; ++i) {
                const name = names[i]
                if (name && name[0] !== '*') params[names[i]] = args[i + 1]
              }
            }
          } else {
            lastNode = null
            break
          }
          lastNode = node
          const next = sections[index + 1]
          if (!next) break
          const child = node._hasAfter ? node._after : node.retrieveChild(next)
          if (!child) {
            lastNode = null
            break
          }
        } else {
          const next = sections[index + 1]
          if (next) {
            const child = node._hasAfter ? node._after : node.retrieveChild(next)
            if (!child) {
              lastNode = null
              break
            }
          } else {
            lastNode = node
            break
          }
        }
        lastNode = node
      } else {
        lastNode = null
        break
      }
    }
    const data = lastNode ? lastNode.data(method) : null
    return data ? { data, params } : null
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
        self._register(path, httpMethod, data)
        response.push(data)
      })
    })
    return response
  }
}
