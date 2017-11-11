import GenericServerException from './genericServerException'

export default class MissingArgumentException extends GenericServerException {
  constructor (message) {
    super('MissingArgumentException', message)
  }
}
