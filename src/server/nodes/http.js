const commonScaffold = require('./common').scaffold

const NotScaffoldException = require('../exceptions/server/notScaffoldException')

class ServerNode {
  constructor (scaffold, id) {
    if (!commonScaffold.isValid(scaffold)) {
      throw new NotScaffoldException(`Missing scaffold properties: ${commonScaffold.getMissingProperties(scaffold)}`)
    }
    this._name = commonScaffold.formatName(scaffold._name, id)
  }
}

module.exports = ServerNode
