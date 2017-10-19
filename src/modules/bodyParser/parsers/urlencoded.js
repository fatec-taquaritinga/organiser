import urlencode from 'urlencode'

export default function (content, options) {
  try {
    urlencode.parse(content, { charset: options.encoding || 'utf8' })
  } catch (exception) {
    return null
  }
}
