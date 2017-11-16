import EventType from './types'
import { resolveInstance } from '../persistence'
import { iterate } from '../utils'

export { EventType }
export { EventHandler } from './decorator'

export class EventBus {
  static get Types () {
    return EventType
  }

  registerListener (eventType, listener) {
    const type = typeof eventType
    const listenerType = typeof listener
    if (listener && type === 'string' && listenerType === 'function') {
      (this[eventType] || (this[eventType] = [])).push(listener)
    } else if (listener && type === 'function' && listenerType === 'function') {
      this.registerListener(eventType.name, listener)
    } else if (type === 'function' && eventType.eventHandler && eventType.eventHandler.type && !listener) {
      this.registerListener(eventType.eventHandler.type, eventType)
    } else if (type === 'object' && !listener) {
      const eventListeners = eventType.eventListeners
      for (let property in eventListeners) {
        const eventHandler = eventType.eventListeners[property]
        if (!eventHandler) continue
        const func = eventType[property]
        if (typeof func === 'function' && eventHandler.type) this.registerListener(eventHandler.type, func)
      }
    } else if (type === 'function' && !listener) {
      this.registerListener(resolveInstance(eventType))
    } else {
      throw new Error('Invalid event type: eventType must be a string, an object or a function.')
    }
  }

  removeListener (eventType, listener) {
    const type = typeof eventType
    if (type === 'string' && listener && typeof listener === 'function') {
      const arr = this[eventType]
      const len = arr.length
      if (arr && len > 0) {
        arr.slice(arr.indexOf(listener), 1)
        if (len === 1) delete listener[type]
      }
    } else if (type === 'function' && eventType.eventHandler && eventType.eventHandler.type && !listener) {
      this.removeListener(eventType.eventHandler.type, eventType)
    } else if (type === 'object' && !listener) {
      for (let property in eventType) {
        const func = eventType[property]
        if (typeof func === 'function' && func.eventHandler && eventType.eventHandler.type) this.removeListener(func.eventHandler.type, func)
      }
    }
  }

  amountOf (eventType) {
    const type = typeof eventType
    if (type === 'string') {
      const listeners = this[eventType]
      if (listeners) return listeners.length
    } else if (type === 'function' && eventType.eventHandler && eventType.eventHandler.type) {
      return this.listenersOf(eventType.eventHandler.type)
    }
    return 0
  }

  emit (eventType, e) {
    const type = typeof eventType
    if (type === 'string') {
      const arr = this[eventType]
      if (arr) iterate(arr, listener => e ? listener(e) : listener())
    } else if (type === 'object' && eventType._eventType) {
      this.emit(eventType._eventType, eventType)
    }
  }
}
