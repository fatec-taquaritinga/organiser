import GenericServerException from './genericServerException'

export default class ValueNotDefinedException extends GenericServerException {
  constructor (message) {
    super('ValueNotDefinedException', message)
  }
}
