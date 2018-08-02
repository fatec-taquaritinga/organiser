const exists = require('./exists')

module.exports = function (obj, ...propertiesNames) {
  return propertiesNames.every((property) => exists(obj, property))
}
