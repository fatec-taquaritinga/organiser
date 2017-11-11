import GenericServerException from './genericServerException'

export default class OperationNotAllowedException extends GenericServerException {
  constructor (message) {
    super('OperationNotAllowedException', message)
  }
}
