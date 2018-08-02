const Exception = require('../exception')

class NotScaffoldException extends Exception {
  constructor (message) {
    super('NotScaffoldException', message)
  }
}

module.exports = NotScaffoldException
