import utils from '../utils'

const parametersRegex = /\{(\S+?)\}/g
const parameterMatchRegex = '([^\\s\\/]+)'

function extractPathParamsIndexes (path, complex) {
  const response = []
  let match = null
  while ((match = parametersRegex.exec(path))) {
    let param
    const args = match[1].split('=', 2)
    if (args.length === 1) {
      param = args[0]
    } else {
      if (complex) {
        param = {
          name: args[0],
          content: args[1],
          search: match[1]
        }
      } else {
        param = args[0]
      }
    }
    response.push(param)
  }
  return response
}

export function extractPathParams (path, input, pathMatcher) {
  const response = {}
  const paramsNames = extractPathParamsIndexes(path, false)
  if (paramsNames.length === 0) return response
  let params = pathMatcher.exec(input)
  for (let i = 1, j = params.length; i < j; ++i) response[paramsNames[i - 1]] = params[i]
  return response
}

export function extractHeaders (request) {
  const headers = request.headers
  const response = {}
  for (let header in headers) response[header.toLowerCase()] = headers[header]
  return response
}

export function generateRouteMatcher (prefix, path) {
  const origin = (path === '/' ? `/${prefix}` : `/${prefix}/${path}`).replace(/\/+/g, '/')
  let pathName = `${origin}`
  let matcher = `${origin}`
  const params = extractPathParamsIndexes(pathName, true)
  utils.iterate(params, (i) => {
    if (typeof i !== 'object') return
    pathName = pathName.replace(i.search, i.name)
    let first = i.content[0]
    matcher = matcher.replace(`{${i.search}}`, first && first === '(' ? i.content : `(${i.content})`)
  })
  matcher = matcher.replace(parametersRegex, parameterMatchRegex).replace('*', parameterMatchRegex)
  return {
    path: pathName,
    matcher: new RegExp(`^${matcher}\\/*$`)
  }
}
