const _ = require('../../utils').objects

const _default = {
  formatName: function (serverName, serverId) {
    return serverName.replace('{id}', serverId)
  },
  encapsuleConfig: function (config) {
    const name = _.getNotEmptyProperty(config, 'name', 'Server #{id}')
    const hostname = _.getNotEmptyProperty(config, 'hostname', 'localhost')
    const port = _.getIntFromProperty(config, 'port', 8080)
    return Object.freeze({
      name,
      hostname,
      port
    })
  }
}

module.exports = _default
