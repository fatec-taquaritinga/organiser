const server = require('./server')

const _default = Object.assign(function (main) {
  console.log(`main file: ${main || '/'}`)
}, server)

module.exports = _default
