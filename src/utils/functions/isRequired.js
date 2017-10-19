import Exceptions from '../../exceptions'

export default function (argumentName) {
  throw new Exceptions.MISSING_ARGUMENT(`"${argumentName}" is required.`)
}
