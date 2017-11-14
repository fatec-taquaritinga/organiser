import 'babel-polyfill'
import { UnexpectedValueException } from '../../exceptions'
import debug from '../../debug'

export function createFlowModifiers (after = [], before = []) {
  return Object.seal({
    after: new FlowModifier(...after),
    before: new FlowModifier(...before)
  })
}

export function returnFlowModifiers (parent, children) {
  return {
    after (...modifiers) {
      const len = modifiers.length
      if (children) {
        for (let value of children) {
          const obj = value._modifiers || value
          if (len === 2 && !isNaN(children[0])) {
            obj.after.register(children[0], children[1])
          } else {
            for (let mod of modifiers) obj.after.register(mod)
          }
        }
      } else {
        const obj = parent._modifiers || parent
        const first = children[0]
        if (len === 2 && !isNaN(first)) {
          obj.after.register(first, children[1])
        } else {
          for (let mod of modifiers) obj.after.register(mod)
        }
      }
      return this
    },
    before (...modifiers) {
      const len = modifiers.length
      if (children) {
        for (let value of children) {
          const obj = value._modifiers || value
          if (len === 2 && !isNaN(children[0])) {
            obj.before.register(children[0], children[1])
          } else {
            let index = len
            while (--index >= 0) {
              obj.before.register(0, modifiers[index])
            }
          }
        }
      } else {
        const obj = parent._modifiers || parent
        const first = children[0]
        if (len === 2 && !isNaN(first)) {
          obj.before.register(first, children[1])
        } else {
          let index = len
          while (--index >= 0) {
            obj.before.register(0, modifiers[index])
          }
        }
      }
      return this
    }
  }
}

class FlowModifier {
  constructor (...modifiers) {
    this.length = 0
    let i = -1
    let modifier
    while ((modifier = modifiers[++i])) {
      if (modifier instanceof FlowModifier) {
        let j = -1
        let k
        while ((k = modifier[++j]) !== undefined) {
          if (k) this.register(k.resolve || k.original)
        }
      } else {
        const type = typeof modifier
        if (type === 'function') {
          this.register(modifier)
        } else if (type === 'object') {
          const mod = modifier.resolve || modifier.original
          debug.assert.is(typeof mod, 'function', 'Modifier must be a function.')
          this.register(mod)
        } else {
          throw new UnexpectedValueException('A modifier must be a function returning a promise or another function!')
        }
      }
    }
  }

  _allocate (i, j) {
    if (this[j] !== undefined) this._allocate(j, j + 1)
    this[j] = this[i]
  }

  _remove (i) {
    const k = (this[i] = this[i + 1])
    if (k === undefined) {
      delete this[i]
    } else {
      this._remove(i + 1)
    }
  }

  register (index, mod, replace = false) {
    if (!mod) return this.register(-1, index, replace)
    if (typeof mod !== 'function') throw new UnexpectedValueException('A modifier must be a function returning a promise or another function!')
    const len = mod.length
    let obj = mod
    if (len === 2) { // connect style (request, next)
      obj = (context) => {
        return new Promise((resolve) => {
          mod(context.request, resolve)
        })
      }
    } else if (len === 3) { // connect style (request, response, next)
      obj = (context) => {
        return new Promise((resolve) => {
          mod(context.request, context.response, resolve)
        })
      }
    } else if (len > 3) { // connect style (err, request, response, next)
      obj = (context) => {
        return new Promise((resolve, reject) => {
          mod(err => reject(err), context.request, context.response, resolve)
        })
      }
    }
    index = index === -1 ? this.length++ : index
    if (!replace && this[index] !== undefined) this._allocate(index, index + 1)
    this[index] = obj === mod ? { original: obj } : { original: mod, resolve: obj }
  }

  indexOf (mod) {
    let i = -1
    let j
    while ((j = this[++i]) !== undefined) {
      if (j && j.original === mod) break
    }
    return j ? i : -1
  }

  remove (mod) {
    let i = -1
    let j
    while ((j = this[++i]) !== undefined) {
      if (j && j.original === mod) {
        this._remove(i)
        break
      }
    }
    return !!j
  }

  async execute (context, cancelOnResponse, r) {
    if (this.length > 0) {
      let run = true
      let response
      let i = -1
      let modifier
      while (run && (modifier = this[++i])) {
        if ((response = await modifier(context, r)) !== undefined && cancelOnResponse) run = false
      }
      return response
    }
  }
}
