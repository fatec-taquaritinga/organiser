export default function ExceptionThrownEvent (exception, isCancelled = false) {
  return Object.seal({
    get _eventType () {
      return 'ExceptionThrownEvent'
    },
    exception,
    isCancelled () {
      return isCancelled
    },
    setCancelled (cancelled) {
      isCancelled = cancelled
    }
  })
}
