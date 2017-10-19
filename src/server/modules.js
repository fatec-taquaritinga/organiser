import 'babel-polyfill'
import { Response } from '../response'
import utils from '../utils'
import Exceptions from '../exceptions'
import debug from '../debug'

export default class ModulesChain {
  constructor (...modulesChains) {
    this.length = 0
    let i = -1
    let modulesChain
    while ((modulesChain = modulesChains[++i]) !== undefined) {
      if (modulesChain) {
        if (modulesChain instanceof ModulesChain) {
          let j = -1
          let k
          while ((k = modulesChain[++j]) !== undefined) {
            if (k) this.register(k.resolve || k.original)
          }
        } else {
          const type = typeof modulesChain
          if (type === 'function') {
            this.register(modulesChain)
          } else if (type === 'object') {
            const mod = modulesChain.resolve || modulesChain.original
            debug.assert.is(typeof mod, 'function', 'Module must be a function.')
            this.register(mod)
          } else {
            throw new Exceptions.UNEXPECTED_VALUE('A module must be a function returning a promise or another function!')
          }
        }
      }
    }
  }
  register (index, mod, replace = false) {
    if (!mod) {
      this.register(-1, index, replace)
      return
    }
    if (typeof mod !== 'function') throw new Exceptions.UNEXPECTED_VALUE('A module must be a function returning a promise or another function!')
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

  _allocate (i, j) {
    if (this[j] !== undefined) this._allocate(j, j + 1)
    this[j] = this[i]
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
        this[i] = null
        break
      }
    }
    return !!j
  }

  async execute (context) {
    if (this.length === 0) return
    let res
    let i = -1
    let j
    while (!res && (j = this[++i]) !== undefined) {
      if (j) {
        const response = await (j.resolve || j.original)(context)
        if (response && response instanceof Response) res = response
      }
    }
    return res
  }
}
