export default function (object, propertyName) {
  const { [propertyName]: removed, ...response } = object
  return response
}
