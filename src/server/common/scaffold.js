const objectUtils = require('../utils').objects

const _default = {
  minProperties: ['_instances'],
  getMissingProperties: function (obj) {
    return objectUtils.getMissingProperties(obj, this.minProperties)
  },
  isValid: function (obj) {
    return objectUtils.isMissingProperties(obj, this.minProperties)
  }
}

module.exports = _default
