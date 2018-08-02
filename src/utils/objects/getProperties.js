module.exports = function (obj, ...propertiesNames) {
  return propertiesNames.map((propertyName) => {
    const typeOfPropertyName = typeof propertyName
    if (typeOfPropertyName === 'object') {
      const value = obj[propertyName.name]
      return value === undefined ? propertyName.value : value
    }
    return obj[propertyName]
  })
}
