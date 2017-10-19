import Exceptions from '../exceptions'

export default function (expression, fallbackValue, errorMessage) {
  if (!expression) {
    if (fallbackValue !== undefined) {
      return fallbackValue
    } else {
      throw new Exceptions.UNEXPECTED_VALUE(errorMessage)
    }
  }
  return true
}

export function isDefined (name, value, fallbackValue, errorMessage) {
  if (value === undefined) {
    throw new Exceptions.VALUE_NOT_DEFINED(errorMessage || `"${name}" must have a defined value!`)
  } else if (value || value === null) {
    return true
  } else if (fallbackValue !== undefined) {
    return fallbackValue
  }
  return false
}

export function isInteger (name, value, fallbackValue, errorMessage) {
  const response = !isNaN(+value || parseInt(value))
  if (!response) {
    if (fallbackValue !== undefined) {
      return fallbackValue
    } else {
      throw new Exceptions.NUMBER_FORMAT(errorMessage || `"${name}" must be an integer number!`)
    }
  }
  return response
}

export function isInArray (arrayName, value, array, fallbackValue, errorMessage) {
  const response = array.indexOf(value) !== -1
  if (!response) {
    if (fallbackValue !== undefined) {
      return fallbackValue
    } else {
      throw new Exceptions.NOT_IN_ARRAY(errorMessage || `Value not found in "${arrayName}": ${value}`)
    }
  }
  return response
}

export function hasProperty (propertyName, property, objectName, object, fallbackValue, errorMessage) {
  const response = object[property]
  if (!response) {
    if (fallbackValue !== undefined) {
      return fallbackValue
    } else {
      throw new Exceptions.NOT_IN_OBJECT(errorMessage || `Property not found in "${objectName}": ${propertyName}`)
    }
  }
  return response
}

export function equals (operation, expected, errorMessage) {
  if (operation !== expected) throw new Exceptions.OPERATION_NOT_ALLOWED(errorMessage)
}

export function hasOperation (operation, errorMessage) {
  if (operation === undefined || operation === null) throw new Exceptions.OPERATION_NOT_ALLOWED(errorMessage)
}

export function exists (entity, entityName, errorMessage) {
  if (entity === undefined) throw new Exceptions.UNEXPECTED_VALUE(errorMessage || `${entityName} was not found.`)
}

export function isValid (entity, entityName, errorMessage) {
  if (entity === undefined || entity === null) throw new Exceptions.UNEXPECTED_VALUE(errorMessage || `${entityName} is not valid.`)
}

export function is (a, b, errorMessage) {
  if (a !== b) throw new Exceptions.UNEXPECTED_VALUE(errorMessage || `${a} is not ${b}.`)
}
