import http from 'http'
import https from 'https'

import debug from '../debug'
import defaultOptions from './options'
import { Router } from './router'
import { EventBus, EventType } from '../events'
import { createFlowModifiers, returnFlowModifiers } from './flow/modifier'
import { Response } from '../response'
import { flow } from './flow'

export const ServerStatus = {
  SERVER_CLOSE: 'SERVER_CLOSE',
  SERVER_OPEN: 'SERVER_OPEN',
  SERVER_BOOT: 'SERVER_BOOT',
  SERVER_SHUTDOWN: 'SERVER_SHUTDOWN'
}

export class Server {
  constructor (options) {
    const requestHandler = (request, response) => {
      request.on('finish', this.onResponseFinished)
      request.on('error', this.onResponseFinished)
      flow(this, request, response, process.hrtime())
    }
    this._start = process.hrtime()
    this.options = isNaN(options) ? options : { port: options }
    this._modifiers = createFlowModifiers()
    this._eventBus = new EventBus()
    this._router = new Router()
    this._status = ServerStatus.SERVER_CLOSE
    this._nodeServer = this._options.https ? https.createServer(this._options.https, requestHandler) : http.createServer(requestHandler)
    this._nodeServer.on('clientError', this.onClientError)
  }

  _onEndpointNotFound () {
    return Response.notFound().build()
  }

  onResponseFinished (i) {
    console.log('onResponseFinished')
    console.log('this:', this)
    console.log('i:', i)
  }

  onClientError (err, socket) {
    if (err) {
      debug.log.error(err)
    }
    socket.end()
  }

  get status () {
    return this._status
  }

  get options () {
    return this._options
  }

  set options (options) {
    this._options = Object.assign(defaultOptions(), options || {})
  }

  use (...apps) {
    return returnFlowModifiers(this, null).before(apps)
  }

  modules (...modules) {
    return this._router.modules(modules)
  }

  routes (...routes) {
    routes = routes.length > 0 ? this._router.register(routes) : null
    return returnFlowModifiers(this._router, routes)
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
