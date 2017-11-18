const log = require('../logging')
const builder = require('../index')
const expectedResponse = require('./expectedResponse')()
const colors = require('colors/safe')
const fs = require('fs-extra')
const path = require('path')

log.info('Building test...')
builder(__dirname).then(() => {
  log.blank()
  log.info('Running test...')
  log.blank()
  return require('./dist/index')()
}).then((result) => {
  return fs.remove(path.join(__dirname, 'dist')).then(() => result)
}).then((result) => {
  log.print('Expected: ' + colors.white(expectedResponse))
  log.print('Received: ' + colors.white(result))
  log.blank()

  if (result && result === expectedResponse) {
    log.success('Test passed.')
  } else {
    log.warning('Test failed.')
  }
})
