const availableCPUs = require('os').cpus().length
const { scaffold: _, httpType: HttpType } = require('./common')

const InvalidParameterValueException = require('../exceptions/server/invalidParameterValueException')

class Scaffold {
  constructor (config) {
    this._config = _.encapsuleConfig(config)
    this._remainingClusters = availableCPUs
    this._instanceCount = 0
  }

  canSpawn () {
    return this._availableClustering > 0
  }

  spawn (httpType) {
    return new Promise((resolve, reject) => {
      const nodeType = HttpType.getPackageName(httpType === undefined ? HttpType.HTTP_2 : httpType)
      if (nodeType === undefined) {
        return reject(new InvalidParameterValueException(`Invalid HttpType: ${httpType}`))
      }
      --this._availableClustering
      const info = {}
      resolve(info)
    })
  }

  * [Symbol.iterator] () {
    let instance = 0
    while (instance < this._instanceCount) {
      yield this[instance++]
    }
  }
}

module.exports = Scaffold
