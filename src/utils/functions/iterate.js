import isRequired from './isRequired'

export default function (arr = isRequired('arr'), onData = isRequired('onData'), onEnd) {
  let response
  let index = -1
  const len = arr ? arr.length : 0
  while (++index < len) {
    let value = onData(arr[index])
    if (value !== undefined) {
      response = value
      break
    }
  }
  if (onEnd) {
    if (response !== undefined) {
      onEnd(response)
    } else {
      onEnd()
    }
  }
}
