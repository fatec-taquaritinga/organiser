import { Response } from '../../response'
import bytes from 'bytes'

// TODO encoding

export default function (options = {}) {
  options = Object.assign({
    length: null,
    limit: '1mb',
    encoding: 'utf8' // TODO
  }, options)
  const length = bytes.parse(options.length)
  const limit = bytes.parse(options.limit)
  return (context) => {
    const request = context.request
    return new Promise((resolve, reject) => {
      let done = false
      let size = 0
      const raw = []
      function onError (err) {
        reject(err)
      }
      function onAborted () {
        if (done) return
        resolve(Response.status(400).build())
      }
      function onData (chunk) {
        if (done) return
        size += chunk.length
        if (limit !== null && size > limit) {
          resolve(Response.status(413).build())
        } else if (length !== null && size > length) {
          resolve(Response.status(413).build())
        } else {
          raw.push(chunk)
        }
      }
      function onEnd () {
        if (done) return
        done = true
        onClose()
        resolve(length !== null && length !== size ? Response.status(400).build() : { rawBody: Buffer.concat(raw).toString() })
      }
      function onClose () {
        request.removeListener('error', onError)
        request.removeListener('aborted', onAborted)
        request.removeListener('data', onData)
        request.removeListener('end', onEnd)
        request.removeListener('close', onClose)
      }
      request.on('error', onError).on('aborted', onAborted).on('close', onClose).on('data', onData).on('end', onEnd)
    })
  }
}
