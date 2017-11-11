import GenericServerException from './genericServerException'

export default class NumberFormatException extends GenericServerException {
  constructor (message) {
    super('NumberFormatException', message)
  }
}
