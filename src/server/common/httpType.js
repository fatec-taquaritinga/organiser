const _default = {
  HTTP: 'http',
  HTTPS: 'https',
  HTTP_2: 'http2',
  isValid: function (type) {
    return this[type.toUpperCase()] !== undefined || Object.values(this).indexOf(type.toLowerCase()) !== -1
  },
  getPackageName: function (type) {
    if (typeof type !== 'string') {
      return undefined
    }
    const packageName = this[type.toUpperCase()]
    if (!packageName) {
      const lowerCase = type.toLowerCase()
      const httpTypes = Object.keys(this)
      const len = httpTypes.length
      for (let i = 0; i < len; ++i) {
        const value = this[httpTypes[i]]
        if (value === lowerCase) {
          return value
        }
      }
      return undefined
    }
    return packageName
  }
}

module.exports = _default
