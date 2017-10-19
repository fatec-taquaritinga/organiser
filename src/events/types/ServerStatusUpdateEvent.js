import debug from '../../debug'

export default function ServerStatusUpdateEvent (status, message, isCancelled = false) {
  debug.assert.isDefined('status', status)
  return Object.seal({
    get _eventType () {
      return 'ServerStatusUpdateEvent'
    },
    get status () {
      return status
    },
    message,
    isCancelled () {
      return isCancelled
    },
    setCancelled (cancelled) {
      isCancelled = cancelled
    }
  })
}
