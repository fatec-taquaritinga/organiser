function test (value) {
  return !isNaN(+value || parseInt(value))
}

function exec (value) {
  return +value || parseInt(value)
}

export default {
  test,
  exec
}
