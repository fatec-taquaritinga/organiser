import 'babel-polyfill'
import { parse as parseUrl } from 'fast-url-parser'
import { buildContext } from '../context'
import { resolveRequestArguments } from '../../injections'
import debug from '../../debug'

function createContext (instance, request, response, requestedAt, pathname, query) {
  let context
  return (retrieve) => retrieve ? context : (context || (context = buildContext(instance, request, response, requestedAt, { pathname, query })))
}

function onEnd (hasDebug, method, input, timing) {
  return hasDebug ? () => {
    const diff = process.hrtime(timing)
    debug.log.info(`(${method}): ${input}`)
    debug.log.info(`Request processed in ${diff[0]}s ${diff[1] / 1000000}ms.`)
  } : undefined
}

export const flow = async function (instance, request, response, requestedAt) {
  const serverModifiers = instance._modifiers
  // run server (before) modifiers
  const serverBefore = serverModifiers.before
  if (serverBefore) {
    await serverBefore.execute()
  }
  // parse route
  const router = instance._router
  const url = request.url
  const parsed = parseUrl(url, false)
  const pathname = parsed.pathname.replace(/\/{2,}/g, '/')
  const route = router.find(pathname, request.method)
  let final
  let context = createContext(instance, request, response, requestedAt, pathname, parsed.query)
  if (route) {
    const routeData = route.data
    const routeModifiers = routeData.modifiers
    // run route (before) modifiers
    const routeBefore = routeModifiers.before
    if (routeBefore) {
      final = await routeBefore.execute(context(), true)
    }
    if (final === undefined) {
      // method resolver
      const resolver = routeData.resolver
      const ctx = context(true)
      const args = resolveRequestArguments(ctx ? ctx.data : undefined, resolver, route.params)
      final = await resolver.controller[resolver.method](args)
      // run route (after) modifiers
      const routeAfter = routeModifiers.after
      if (routeAfter) {
        const after = await routeAfter.execute(context(), true)
        if (after) final = after
      }
    }
  } else {
    // route not found
    final = instance._onEndpointNotFound()
  }
  // run server (after) modifiers
  const serverAfter = serverModifiers.after
  if (serverAfter) {
    const after = await (final !== undefined ? serverAfter.execute(context(), false, final) : serverAfter.execute())
    if (after) final = after
  }
  // send final response
  router.terminate(response, final, onEnd(instance.options.internal.debug, request.method, pathname, requestedAt))
}
