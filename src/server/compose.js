export function handleFlowOld (router, context, children, i, j, flow, k, l) {
  const current = children[i]
  if (current) {
    return current.then((response) => {
      if (response === undefined) {
        if (i === j) {
          if (k === l) {
            return router.terminate(context)
          } else {
            const nextFlowId = k + 1
            const nextFlow = flow[nextFlowId]
            return handleFlowOld(router, context, nextFlow, 0, nextFlow.length - 1, flow, nextFlowId, l)
          }
        } else {
          return handleFlowOld(router, context, children, i + 1, j, flow, k, l)
        }
      } else {
        return router.terminate(context, response)
      }
    })
  } else {
    return router.terminate(context)
  }
}

export async function loopThroughPromisesArray (context, arr) {
  let i = -1
  let j
  let response
  while ((j = arr[++i]) && ((response = await j(context)) !== undefined)) {}
  return response
}
