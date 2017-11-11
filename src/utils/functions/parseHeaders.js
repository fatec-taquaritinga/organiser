import iterate from './iterate'

export default function (headers) {
  const response = {}
  iterate(Object.keys(headers), (header) => {
    response[header.toLowerCase()] = headers[header]
  })
  return response
}
