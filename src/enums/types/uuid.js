import generate from 'uuid/v4'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default {
  test: (value) => true,
  exec: (value) => {
    if (!value) return generate()
    let str = (typeof value === 'string' ? value : (value.toString ? value.toString() : null))
    if (!str) return null
    let len = str.length
    if (len === 32) {
      len = 36
      str = `${str.substr(0, 8)}-${str.substr(8, 4)}-${str.substr(12, 4)}-${str.substr(16, 4)}-${str.substr(20, 12)}`
    }
    return str && len === 36 && uuidRegex.test(str) ? str : null
  }
}
