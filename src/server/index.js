import http from 'http'
import https from 'https'

import debug from '../debug'
import defaultOptions from './defaultOptions'
import Router from './router'
import { EventBus, EventType } from '../events'

export const ServerStatus = {
  SERVER_CLOSE: 'SERVER_CLOSE',
  SERVER_OPEN: 'SERVER_OPEN',
  SERVER_BOOT: 'SERVER_BOOT',
  SERVER_SHUTDOWN: 'SERVER_SHUTDOWN'
}

export class Server {
  constructor (options) {
    this._start = process.hrtime()
    this.options = isNaN(options) ? options : { port: options }
    this._eventBus = new EventBus(this)
    this._router = new Router(this)
    this._status = ServerStatus.SERVER_CLOSE
    this._nodeServer = this._options.https ? https.createServer(this._options.https) : http.createServer()
    this._nodeServer.on('request', (request, response) => {
      this._router.resolveRoute(Object.create({ instance: this, request, response, timing: process.hrtime() }))
    })
  }

  get status () {
    return this._status
  }

  get options () {
    return this._options
  }

  set options (options) {
    this._options = Object.assign(defaultOptions, options || {})
  }

  modules (...modules) {
    return this._router.modules(modules)
  }

  routes (...routes) {
    routes = routes.length > 0 ? this._router.register(routes) : null
    const router = this._router
    return {
      after (...modules) {
        const len = modules.length
        if (routes) {
          for (let route of routes) {
            if (len === 2 && !isNaN(routes[0])) {
              route.modules.after.register(routes[0], routes[1])
            } else {
              for (let mod of modules) route.modules.after.register(mod)
            }
          }
        } else {
          if (len === 2 && !isNaN(routes[0])) {
            router._modules.after.register(routes[0], routes[1])
          } else {
            for (let mod of modules) router._modules.after.register(mod)
          }
        }
        return this
      },
      before (...modules) {
        const len = modules.length
        if (routes) {
          for (let route of routes) {
            if (len === 2 && !isNaN(routes[0])) {
              route.modules.before.register(routes[0], routes[1])
            } else {
              let index = len
              while (--index >= 0) {
                route.modules.before.register(0, modules[index])
              }
            }
          }
        } else {
          if (len === 2 && !isNaN(routes[0])) {
            router._modules.before.register(routes[0], routes[1])
          } else {
            let index = len
            while (--index >= 0) {
              router._modules.before.register(0, modules[index])
            }
          }
        }
        return this
      }
    }
  }

  set isRunning (isRunning) {
    if (isRunning) {
      if (this.isRunning) {
        this.reboot()
      } else {
        this.boot()
      }
    } else {
      this.close()
    }
  }

  get isRunning () {
    return (this._nodeServer && this._nodeServer.listening) || false
  }

  registerListener (eventType, listener) {
    this._eventBus.registerListener(eventType, listener)
  }

  removeListener (eventType, listener) {
    this._eventBus.removeListener(eventType, listener)
  }

  emitEvent (eventType, e) {
    this._eventBus.emit(eventType, e)
  }

  boot () {
    return new Promise((resolve, reject) => {
      const bootEvent = EventType.SERVER_STATUS_UPDATE_EVENT(ServerStatus.SERVER_BOOT)
      this.emitEvent(bootEvent)
      if (bootEvent.isCancelled()) {
        resolve(this._status)
        process.exit()
      } else {
        this._nodeServer.listen(this._options.port, this._options.host, (err) => {
          if (err) {
            reject(err)
            return
          }
          const diff = process.hrtime(this._start)
          const e = EventType.SERVER_STATUS_UPDATE_EVENT(ServerStatus.SERVER_OPEN, `(${((diff[0] * 1000000000) + diff[1]) / 1000000000}s) ${this._options.name} is up and running at ${this._options.host}:${this._options.port}.`)
          this.emitEvent(e)
          if (e.isCancelled()) {
            this.close().then((serverStatus) => resolve(serverStatus))
          } else {
            if (e.message) debug.log.success(e.message)
            resolve((this._status = e.status))
          }
        })
      }
    })
  }

  close () {
    return new Promise((resolve, reject) => {
      const shutdownEvent = EventType.SERVER_STATUS_UPDATE_EVENT(ServerStatus.SERVER_SHUTDOWN)
      this.emitEvent(shutdownEvent)
      if (shutdownEvent.isCancelled()) {
        resolve(this._status)
      } else {
        this._nodeServer.close((err) => {
          if (err) {
            reject(err)
            return
          }
          const e = EventType.SERVER_STATUS_UPDATE_EVENT(ServerStatus.SERVER_SHUTDOWN, `${this._options.name} is now closed.`)
          this.emitEvent(e)
          if (e.isCancelled()) {
            resolve(this._status)
          } else {
            if (e.message) debug.log.warning(e.message)
            resolve((this._status = e.status))
          }
        })
      }
    })
  }

  reboot () {
    this.close().then(this.boot)
  }
}
