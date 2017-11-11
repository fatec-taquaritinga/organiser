import GenericServerException from './genericServerException'

export default class NotInObjectException extends GenericServerException {
  constructor (message) {
    super('NotInObjectException', message)
  }
}
