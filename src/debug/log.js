import { EOL } from 'os'
import colors from 'colors/safe'

const successPrefix = '\u2713 '
const informationPrefix = '\uD83D\uDEC8 '
const warningPrefix = '\u26A0 '
const errorPrefix = '\u2716 '

function filter (message) {
  return typeof message === 'string' ? message : JSON.stringify(message)
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

export function error (message) {
  process.stdout.write(colors.bgRed.white(`${errorPrefix} ${filter(message)}${EOL}`))
}
