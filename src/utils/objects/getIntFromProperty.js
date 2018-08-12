const parseInt = require('../math/parseInt')

module.exports = function (obj, propertyName, defaultValue) {
  const value = parseInt(obj[propertyName])
  return isNaN(value) ? defaultValue : value
}
