class Exception extends Error {
  constructor (name, message) {
    super(message || name)
    if (name && message) this.name = name
    this._internalException = true
  }
}

module.exports = Exception
