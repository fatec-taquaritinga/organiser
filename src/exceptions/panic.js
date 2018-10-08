class Panic extends Error {
  constructor (message) {
    super(message)
    this._internalException = true
  }
}

module.exports = Panic
