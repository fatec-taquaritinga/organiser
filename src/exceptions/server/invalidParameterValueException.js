const Exception = require('../exception')

class InvalidParameterValueException extends Exception {
  constructor (message) {
    super('InvalidParameterValueException', message)
  }
}

module.exports = InvalidParameterValueException
