module.exports = function (obj, propertyName, defaultValue) {
  const value = obj[propertyName]
  return value === undefined || value === null || value === '' ? defaultValue : value
}
