const http = require('./http')
const https = require('./https')
const http2 = require('./http2')

const _default = {
  http,
  https,
  http2
}

module.exports = _default
