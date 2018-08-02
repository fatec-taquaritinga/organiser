const commonScaffold = require('./common').scaffold

const NotScaffoldException = require('../exceptions/server/notScaffoldException')

class ServerNode {
  constructor (scaffold) {
    if (!commonScaffold.isValid(scaffold)) {
      throw new NotScaffoldException(`Missing scaffold properties: ${commonScaffold.getMissingProperties(scaffold)}`)
    }
  }
}

module.exports = ServerNode
