import isRequired from './isRequired'

export default function (arr = isRequired('arr'), onData = isRequired('onData'), onEnd) {
  let response
  let i = -1
  const len = arr.length
  while (response === undefined && ++i < len) {
    response = onData(arr[i])
  }
  if (onEnd) onEnd(response)
}
