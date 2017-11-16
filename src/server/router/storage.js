import { StaticRoutes, RouteNode } from './structures'

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

export class RouterStorage {
  constructor () {
    this._root = new RouteNode()
    this._static = new StaticRoutes()
  }

  register (path, method, data) {
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
    } else {
      this._static.set(path, method, data)
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
}
