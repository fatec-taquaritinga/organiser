function exec (value) {
  const type = typeof value
  if (type === 'string') {
    return value
  } else if (type === 'number') {
    return isNaN(value) ? null : `${value}`
  } else if (type === 'object') {
    return JSON.stringify(value)
  } else if (type === 'function') {
    return exec(value())
  }
  return value && value.toString ? value.toString() : null
}

export default {
  test: (value) => true,
  exec
}
