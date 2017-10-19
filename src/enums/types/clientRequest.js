function test (value) {
  return typeof value === 'object' && ((value.context && value.context.request) || value.request)
}

function exec (value) {
  return value.context ? value.context.request : value.request
}

export default {
  test,
  exec
}
