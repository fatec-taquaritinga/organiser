import debug from '../debug'
import { iterate, isRequired } from '../utils'
import { createFlowModifiers } from '../server/flow/modifier'

const instances = {}

function persist (target, persistObjects = true) {
  if (target !== undefined || target !== null) {
    const type = typeof target
    if (type === 'function') {
      return target._ || (target._ = Object.create({
        constructor: null,
        path: null,
        modules: null
      }))
    } else if (persistObjects && type === 'object') {
      return target._ || (target._ = {})
    }
  }
  return null
}

function persistMethods (persistence, property) {
  return (persistence[property] || (persistence[property] = Object.create({
    types: [],
    path: null,
    args: null,
    strict: false,
    modules: null
  })))
}

function persistModules (persistence) {
  return persistence.modules || (persistence.modules = createFlowModifiers())
}

export function retrieve (target) {
  return target ? target._ : undefined
}

export function handleHttpMethod (target, property, descriptor, method) {
  debug.assert.exists(target, target.name || target)
  debug.assert.hasOperation(descriptor, `You can't use ${method} with ${target.name || target}.`)
  const persistence = persist(target)
  // debug.assert.hasOperation(persistence.httpMethods, `You can't use ${method} with ${target.name || target}.`)
  // persistence.httpMethods[method] = property
  const types = persistMethods(persistence, property).types
  if (types.indexOf(method) === -1) types.push(method)
}

export function handlePath (target, property, descriptor, path) {
  if (path === undefined) isRequired('path')
  debug.assert.exists(target, target.name || target)
  debug.assert.is(typeof path, 'string', 'Path must be a string.')
  if (descriptor) { // class functions
    const methodPersistence = persistMethods(persist(target), property)
    methodPersistence.path = path
  } else { // class
    persist(target).path = path
  }
}

export function handleArguments (target, property, descriptor, args) {
  if (args.length === 0) isRequired('args')
  debug.assert.exists(target, target.name || target)
  if (descriptor) { // class functions - model definition
    const persistence = persistMethods(persist(target), property)
    const strict = args[1]
    persistence.args = args[0] // model
    persistence.strict = (strict === true || strict === false) ? strict : false
  } else { // class - constructor injection
    persist(target).constructor = args
  }
}

export function handleModules (target, property, descriptor, modules, before) {
  if (modules.length === 0) isRequired('modules')
  debug.assert.exists(target, target.name || target)
  const mods = persistModules(descriptor ? persistMethods(persist(target), property) : persist(target))
  const chain = before ? mods.before : mods.after
  iterate(modules, (mod) => {
    chain.push(mod)
  })
}

export function resolveArgumentsInjection (object) {
  const persistence = persist(object, false)
  const injections = persistence ? persistence.constructor : null
  const constructorArguments = []
  if (injections && Array.isArray(injections)) {
    iterate(injections, (arg) => {
      const args = resolveArgumentsInjection(arg)
      if (args.length === 0) { // end of injections
        constructorArguments.push(typeof arg === 'function' ? resolveInstance(arg) : arg) // try to resolve function or class, or use raw value
      } else if (typeof arg === 'function') {
        constructorArguments.push(resolveInstance(arg, args)) // initialize and cache / retrieve instance
      } else {
        constructorArguments.push(arg) // raw value
      }
    })
  }
  return constructorArguments
}

export function resolveInstance (instance, args) {
  let arg = instances[instance] // retrieve cached instance
  if (!arg) {
    try {
      arg = args ? instance(args) : instance()
    } catch (exception) {
      const msg = exception.message
      if (msg === 'Cannot call a class as a function' || msg.substring(msg.length - 31) === 'cannot be invoked without \'new\'') {
        arg = (instances[instance] = new (instance.bind.apply(instance, args ? [instance, ...args] : [instance]))())// eslint-disable-line no-useless-call
      } else if (typeof instance === 'function') {
        arg = instance
      } else {
        arg = null
        debug.log.error(`Error while injecting "${instance.name || instance.toString()}" as an argument: ${msg}`)
      }
    }
  }
  return arg
}
