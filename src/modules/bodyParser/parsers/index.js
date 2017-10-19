import contentTypes from '../../../response/mediaType'
import json from './json'
import urlencoded from './urlencoded'

export const parsers = Object.create({
  [contentTypes.APPLICATION_JSON]: json,
  [contentTypes.APPLICATION_FORM_URLENCODED]: urlencoded
})

export default Object.freeze({
  parseFromContentType: (contentType, content, options) => {
    const parser = parsers[contentType]
    return parser ? parser(content, options) : null
  },
  parse: (content, options) => {
    for (let parser in parsers) {
      const response = parsers[parser](content, options)
      if (response) return response
    }
    return content // no compatible parser available
  }
})

// check Content-Type header and check if there is converter available (raw?)
// content-type -> json -> x-www-form-urlencoded -> form-data -> binary
