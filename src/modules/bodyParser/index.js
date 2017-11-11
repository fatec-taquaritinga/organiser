import raw from './raw'
import parsers from './parsers'

export default function (options = {}) {
  const rawParser = raw(options)
  return function (context) {
    return new Promise(function (resolve, reject) {
      rawParser(context)
        .then((content) => {
          const { data } = context
          if (typeof content !== 'string') {
            const contentType = data.headers['content-type']
            data.body = contentType ? parsers.parseFromContentType(contentType, content, options) : parsers.parse(content, options)
            resolve()
          } else {
            resolve(content)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

// check Content-Type header and check if there is converter available (raw?)
// content-type -> json -> x-www-form-urlencoded -> form-data -> binary
