import valueNotDefinedException from './valueNotDefinedException'
import numberFormatException from './numberFormatException'
import notInArrayException from './notInArrayException'
import notInObjectException from './notInObjectException'
import unexpectedValueException from './unexpectedValueException'
import typeAlreadyExistsException from './typeAlreadyExistsException'
import missingArgumentException from './missingArgument'
import strictModeException from './strictMode'
import operationNotAllowedException from './operationNotAllowedException'

export default {
  VALUE_NOT_DEFINED: valueNotDefinedException,
  NUMBER_FORMAT: numberFormatException,
  NOT_IN_ARRAY: notInArrayException,
  NOT_IN_OBJECT: notInObjectException,
  UNEXPECTED_VALUE: unexpectedValueException,
  TYPE_ALREADY_EXISTS: typeAlreadyExistsException,
  MISSING_ARGUMENT: missingArgumentException,
  STRICT_MODE: strictModeException,
  OPERATION_NOT_ALLOWED: operationNotAllowedException
}
