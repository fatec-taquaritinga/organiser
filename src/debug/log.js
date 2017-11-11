import { EOL } from 'os'
import colors from 'colors/safe'

import { EventType } from '../events'

const successPrefix = '\u2713 '
const informationPrefix = '\uD83D\uDEC8 '
const warningPrefix = '\u26A0 '
const errorPrefix = '\u2716 '

function filter (message) {
  return typeof message === 'string' ? message : JSON.stringify(message)
}

function extractStacktrace (exception) {
  if (exception._internalException) {
    const stacktrace = exception.stack.split('\n')
    let builder = stacktrace[0]
    let i = 3
    let line
    while ((line = stacktrace[++i])) {
      builder = `${builder}\n${line}`
    }
    return builder
  } else {
    return exception.stack
  }
}

export function success (message) {
  process.stdout.write(colors.green(`${successPrefix} ${filter(message)}${EOL}`))
}

export function info (message) {
  process.stdout.write(colors.cyan(`${informationPrefix} ${filter(message)}${EOL}`))
}

export function warning (message) {
  process.stdout.write(colors.red(`${warningPrefix} ${filter(message)}${EOL}`))
}

export function print (message) {
  process.stdout.write(colors.grey(`${informationPrefix} ${filter(message)}${EOL}`))
}

export function error (instance, message, exception) {
  if (instance && (!message || !message)) {
    return error(null, instance, exception)
  } else if (message && !exception && typeof message === 'object') {
    return error(instance, null, message)
  }
  if (instance && exception) {
    const e = EventType.EXCEPTION_THROWN_EVENT(exception)
    instance.emitEvent(EventType)
    if (!e.isCancelled()) {
      process.stderr.write(colors.bgRed.white(`${errorPrefix} ${filter(extractStacktrace(exception))}${EOL}`))
    }
  } else if (exception) {
    process.stderr.write(colors.bgRed.white(`${errorPrefix} ${filter(extractStacktrace(exception))}${EOL}`))
  } else if (message) {
    process.stderr.write(colors.bgRed.white(`${errorPrefix} ${filter(message)}${EOL}`))
  }
}
