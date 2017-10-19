export function EventHandler (eventType) {
  return (target, property, descriptor) => {
    if (!descriptor) return
    if (!target.eventListeners) target.eventListeners = {}
    if (!target.eventListeners[property]) target.eventListeners[property] = {}
    const type = typeof eventType
    let eventHandler
    if (type === 'string') {
      eventHandler = { type: eventType }
    } else if (type === 'object') {
      eventHandler = { type: eventType._eventType }
    } else if (type === 'function') {
      eventHandler = { type: eventType.name }
    } else {
      throw new Error('eventType must be a string!')
    }
    target.eventListeners[property] = eventHandler
  }
}
