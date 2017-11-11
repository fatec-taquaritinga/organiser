import GenericServerException from './genericServerException'

export default class TypeAlreadyExistsException extends GenericServerException {
  constructor (message) {
    super('TypeAlreadyExistsException', message)
  }
}
