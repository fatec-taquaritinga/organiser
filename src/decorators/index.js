import { handleArguments, handlePath, handleHttpMethod, handleModifiers } from '../persistence'

export function Arguments (...args) {
  return (target, property, descriptor) => handleArguments(target, property, descriptor, args)
}

export function Path (path) {
  return (target, property, descriptor) => handlePath(target, property, descriptor, path)
}

export function ModulesAfter (...modules) {
  return (target, property, descriptor) => handleModifiers(target, property, descriptor, modules, false)
}

export function ModulesBefore (...modules) {
  return (target, property, descriptor) => handleModifiers(target, property, descriptor, modules, true)
}

export function GET (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'GET')
}

export function HEAD (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'HEAD')
}

export function POST (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'POST')
}

export function PUT (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'PUT')
}

export function DELETE (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'DELETE')
}

export function OPTIONS (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'OPTIONS')
}

export function TRACE (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'TRACE')
}

export function PATCH (target, property, descriptor) {
  handleHttpMethod(target, property, descriptor, 'PATCH')
}
