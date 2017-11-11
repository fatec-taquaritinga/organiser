import { TypeAlreadyExistsException } from '../../exceptions'
import uuid from './uuid'
import string from './string'
import boolean from './boolean'
import integer from './integer'
import clientRequest from './clientRequest'
import serverResponse from './serverResponse'

export const Types = Object.create({
  UUID: 'uuid',
  STRING: 'string',
  BOOLEAN: 'boolean',
  INTEGER: 'integer',
  DOUBLE: 'double',
  FLOAT: 'float',
  DATE: 'date',
  FILE: 'file', // TODO multipartFile
  CLIENT_REQUEST: 'clientRequest',
  SERVER_RESPONSE: 'serverResponse',
  registerCustomType,
  unregisterCustomType,
  exists
})

const types = Object.create({
  uuid,
  string,
  boolean,
  integer,
  clientRequest,
  serverResponse
})

function registerCustomType (propertyName, typeName, typeConverter) {
  if (!typeConverter && typeof typeName === 'object') return registerCustomType(propertyName, propertyName, typeName)
  if (propertyName && typeName && typeConverter && typeConverter.test && typeConverter.test.length === 1 && typeConverter.exec && typeConverter.exec.length === 1) {
    propertyName = propertyName.toUpperCase()
    if (Types[propertyName]) throw new TypeAlreadyExistsException(`${propertyName} is already registered.`)
    Types[propertyName] = typeName
    types[typeName] = typeConverter
    return true
  }
  return false
}

// Deprecated
function unregisterCustomType (name) {
  if (!name) return false
  const upperCase = name.toUpperCase()
  if (Types[upperCase] && types[name]) {
    delete Types[name.toUpperCase()]
    delete types[name]
    return true
  }
  return false
}

function exists (type) {
  return types[type] !== undefined
}

export function transform (value, to) {
  const type = types[to]
  return type && type.test(value) ? type.exec(value) : null
}
