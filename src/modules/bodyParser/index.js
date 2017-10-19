import raw from './raw'
import parsers from './parsers'

export default function (options = {}) {
  const rawParser = raw(options)
  return function (context) {
    return new Promise((resolve, reject) => {
      rawParser(context)
        .then(content => {
          const contentType = context.headers['content-type']
          const body = contentType ? parsers.parseFromContentType(contentType, content.rawBody, options) : parsers.parse(content.rawBody, options)
          resolve({ body })
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

// check Content-Type header and check if there is converter available (raw?)
// content-type -> json -> x-www-form-urlencoded -> form-data -> binary
