function test (value) {
  return typeof value === 'object' && ((value.context && value.context.response) || value.response)
}

function exec (value) {
  return value.context ? value.context.response : value.response
}

export default {
  test,
  exec
}
