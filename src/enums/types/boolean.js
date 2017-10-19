function test (value) {
  return value === 0 || value === 1 || value === true || value === false ||
         value === '0' || value === '1' || value === 'true' || value === 'false' ||
         (typeof value === 'function' && test(value()))
}

function exec (value) {
  const type = typeof value
  if (type === 'boolean') {
    return value
  } else if (type === 'string') {
    if (value === '0') {
      return false
    } else if (value === '1') {
      return true
    } else if (value === 'false') {
      return false
    } else if (value === 'true') {
      return true
    }
  } else if (type === 'number') {
    return value === 0 ? false : (value === 1 ? true : null)
  } else if (type === 'function') {
    return exec(value())
  }
  return null
}

export default {
  test,
  exec
}
