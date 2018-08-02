module.exports = function (obj, ...propertiesNames) {
  return propertiesNames.filter((propertyName) => obj[propertyName] === undefined)
}
