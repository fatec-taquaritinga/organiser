const getMissingProperties = require('./getMissingProperties')

module.exports = function (obj, ...propertiesNames) {
  return getMissingProperties(obj, propertiesNames).length > 0
}
