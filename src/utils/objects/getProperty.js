module.exports = function (obj, propertyName, defaultValue) {
  const value = obj[propertyName]
  return value === undefined ? defaultValue : value
}
