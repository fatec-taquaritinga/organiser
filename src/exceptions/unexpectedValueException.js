import GenericServerException from './genericServerException'

export default class UnexpectedValueException extends GenericServerException {
  constructor (message) {
    super('UnexpectedValueException', message)
  }
}
