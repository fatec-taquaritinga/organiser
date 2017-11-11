import GenericServerException from './genericServerException'

export default class MissingPropertyException extends GenericServerException {
  constructor (message) {
    super('MissingPropertyException', message)
  }
}
