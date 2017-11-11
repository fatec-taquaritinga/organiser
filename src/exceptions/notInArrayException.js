import GenericServerException from './genericServerException'

export default class NotInArrayException extends GenericServerException {
  constructor (message) {
    super('NotInArrayException', message)
  }
}
