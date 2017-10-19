export default function (content, options) {
  // assert charset? (RFC 7159, 8.1)
  try {
    return content && content[0] ? JSON.parse(content) : null
  } catch (exception) {
    return null
  }
}
