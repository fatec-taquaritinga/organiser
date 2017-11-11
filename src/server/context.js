import { OperationNotAllowedException } from '../exceptions'

export function buildContext (instance, request, response, requestedAt) {
  const data = Object.seal({
    query: undefined,
    url: undefined,
    headers: {},
    body: {},
    store: {}
  })
  return Object.seal({
    set instance (instance) {
      throw new OperationNotAllowedException('You can\'t change the server instance of a request.')
    },
    get instance () {
      return instance
    },
    set request (request) {
      throw new OperationNotAllowedException('You can\'t change the request object.')
    },
    get request () {
      return request
    },
    set response (response) {
      throw new OperationNotAllowedException('You can\'t change the response object.')
    },
    get response () {
      return response
    },
    set timing (timing) {
      throw new OperationNotAllowedException('This is not a DeLorean, Doc...')
    },
    get timing () {
      return requestedAt
    },
    set data (data) {
      throw new OperationNotAllowedException('You can\'t change the data object.')
    },
    get data () {
      return data
    }
  })
}