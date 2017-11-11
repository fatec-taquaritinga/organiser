export class RouteNode {
  constructor (node, parent) {
    this._children = {}
    this._after = null
    this._hasAfter = false
    if (node) {
      this._content = node
      this._hasParamaters = typeof node === 'object'
      this._data = {}
      this._parent = parent
    }
  }

  child (section) {
    return this._children[section] || (this._children[section] = new RouteNode(section))
  }

  retrieveChild (section) {
    return this._children[section]
  }

  setAfter (section) {
    const i = this._after
    if (i) {
      if (JSON.stringify(i._content) !== JSON.stringify(section)) {
        throw new Error(`"${section}" is overriding "${i._content.matcher.source}".`)
      }
      return i
    }
    this._hasAfter = true
    return (this._after = new RouteNode(section))
  }

  data (method, obj) {
    if (!obj) return this._data[method]
    if (this._data[method]) {
      throw new Error('Route already exists!')
    } else {
      this._data[method] = obj
    }
  }
}

export class StaticRoutes {
  set (path, method, data) {
    (this[path] || (this[path] = {}))[method] = { data }
  }

  get (path, method) {
    const handlers = this[path]
    return handlers ? handlers[method] : null
  }
}
