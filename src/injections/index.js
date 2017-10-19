import { Types, transform } from '../enums/types'
import { ParamTypes } from '../enums/paramTypes'
import { extractPathParams } from '../server/utils'
import { handleArguments } from '../persistence'

export function resolveRequestArguments (context) {
  return new Promise((resolve) => {
    const route = context.route
    const resolver = route.resolver
    const method = resolver.persistence[resolver.method]
    const requestedArgs = method.args
    if (requestedArgs && Object.keys(requestedArgs).length > 0) {
      resolveModel(requestedArgs, method.strict, {
        path: extractPathParams(route.path, context.url.input, route.matcher),
        query: context.url.parsed.query,
        body: context.body || {},
        context
      }, null, resolve)
    } else {
      resolve(null)
    }
  })
}

function resolveModel (model, strictMode, data, parentWhere = null, resolve = null) {
  // TODO strict mode
  // + needs to check inner models
  const response = {}
  for (let property in model) {
    const propertyValue = model[property]
    const parameter = retrieveParameter(property, propertyValue, data, parentWhere)
    let value = retrieveParameterAt(property, parameter.where, data, parameter.defaultValue)
    if (parameter.isModel && value) {
      const model = parameter.type()
      if (typeof model === 'object') {
        let modelData = data
        if (parameter.where === ParamTypes.PATH) {
          modelData = {
            path: value,
            query: data.query,
            body: data.body
          }
        } else if (parameter.where === ParamTypes.QUERY) {
          modelData = {
            path: data.path,
            query: value,
            body: data.body
          }
        } else if (parameter.where === ParamTypes.PAYLOAD) {
          modelData = modelData = {
            path: data.path,
            query: data.query,
            body: value
          }
        }
        value = resolveModel(model, strictMode, modelData, parameter.where)
      } else {
        value = model
      }
    } else if (parameter.isModel && !value && !isValidValue(value)) { // if there is no value, then this property is probably a general model
      value = parameter.type()
      if (typeof value === 'object') value = resolveModel(value, strictMode, data, retrieveDefaultParamType(propertyValue))
    // TODO array implementation
    } else if (parameter.type && value) {
      value = transform(value, parameter.type)
    } else if ((parameter.type === Types.CLIENT_REQUEST || parameter.type === Types.SERVER_RESPONSE) && !value) {
      value = transform(data.context, parameter.type)
    }
    const propertyResponse = isValidValue(value) ? value : (value || null) // if value is undefined or null and not optional, we keep it as null
    if (propertyResponse !== null && !parameter.isOptinal) {
      response[property] = propertyResponse
    }
  }
  if (resolve) {
    resolve(response)
  } else {
    return response
  }
}

function isValidValue (value) {
  const type = typeof value
  return value ? true : (!!(type === 'boolean' || type === 'number'))
}

function retrieveParameter (property, value, data, parentWhere) {
  const type = extractTypeFromArgument(value, false)
  const isModel = typeof type === 'function'
  return {
    name: property,
    type,
    where: retrieveParameterType(property, value, isModel, data, parentWhere),
    defaultValue: retrieveDefaultValue(value),
    isOptinal: value.optional || false,
    isModel
  }
}

function retrieveDefaultValue (value) {
  const defaultValue = value.defaultValue
  if (isValidValue(defaultValue)) return defaultValue
  const val = value.value
  if (isValidValue(val)) return val
  const fallback = value.fallback
  if (isValidValue(fallback)) return fallback
  return null
}

function retrieveDefaultParamType (paramInfo) {
  return paramInfo.parameterType || paramInfo.paramType || paramInfo.paramTypes || paramInfo.parameter ||
  paramInfo.param || null
}

function retrieveParameterType (paramName, paramInfo, isModel, data, parentWhere) {
  return retrieveDefaultParamType(paramInfo) || parentWhere || (isModel ? ParamTypes.PAYLOAD
            : (data.path[paramName] ? ParamTypes.PATH
              : (data.query[paramName] ? ParamTypes.QUERY : ParamTypes.PAYLOAD)))
}

function retrieveParameterAt (paramName, where, data, defaultValue) {
  if (where === ParamTypes.PATH) {
    return data.path[paramName] || defaultValue
  } else if (where === ParamTypes.QUERY) {
    return data.query[paramName] || defaultValue
  } else if (where === ParamTypes.PAYLOAD) {
    return data.body[paramName] || defaultValue
  }
  return defaultValue
}

function extractTypeFromArgument (arg, inside) {
  const type = typeof arg
  if (type === 'string') {
    return Types.exists(arg) ? arg : null
  } else if (type === 'object') {
    return !inside && arg.type ? extractTypeFromArgument(arg.type, true) : arg
  } else if (type === 'function') {
    return arg
  }
  return null
}
