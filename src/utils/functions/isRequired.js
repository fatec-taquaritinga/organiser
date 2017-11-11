import { MissingArgumentException } from '../../exceptions'

export default function (argumentName) {
  throw new MissingArgumentException(`"${argumentName}" is required.`)
}
