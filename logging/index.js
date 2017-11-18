const os = require('os')
const colors = require('colors/safe')

const EOL = os.EOL
const successPrefix = '\u2713 '
const informationPrefix = '\uD83D\uDEC8 '
const warningPrefix = '\u26A0 '
const errorPrefix = '\u2716 '

function extractStacktrace (exception, offset = 0) {
  const stacktrace = exception.stack.split('\n')
  let builder = stacktrace[0]
  let i = offset
  let line
  while ((line = stacktrace[++i])) {
    builder = `${builder}\n${line}`
  }
  return builder
}

function filter (message) {
  return typeof message === 'string' ? message : JSON.stringify(message)
}

module.exports = {
  blank: function (message) {
    process.stdout.write(message ? filter(message) + EOL : EOL)
  },
  success: function (message) {
    process.stdout.write(colors.green(successPrefix + ' ' + filter(message) + EOL))
  },
  info: function (message) {
    process.stdout.write(colors.cyan(informationPrefix + ' ' + filter(message) + EOL))
  },
  warning: function (message) {
    process.stdout.write(colors.red(warningPrefix + ' ' + filter(message) + EOL))
  },
  print: function (message) {
    process.stdout.write(colors.grey(informationPrefix + ' ' + filter(message) + EOL))
  },
  error: function (message, offset) {
    const type = typeof message
    if (type === 'string') {
      process.stderr.write(colors.bgRed.white(errorPrefix + ' ' + filter(message) + EOL))
    } else if (type === 'object') {
      process.stderr.write(colors.bgRed.white(errorPrefix + ' ' + filter(extractStacktrace(message, offset)) + EOL))
      process.exit(0)
    }
  }
}
