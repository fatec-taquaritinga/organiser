import HttpStatus from './status'
import MediaType from './mediaType'
import serveStatic from './static'

export { MediaType, HttpStatus }

class ResponseBuilder {
  constructor (statusCode, mediaType, entity) {
    this._status = statusCode
    this._entity = entity
    this._encoding = 'utf8'
    this._headers = {
      'Content-Type': mediaType
    }
  }

  build () {
    return new Response(this)
  }

  status (status) {
    this._status = status
    return this
  }

  entity (entity) {
    this._entity = entity
    return this
  }

  type (mediaType) {
    this._headers['Content-Type'] = mediaType
    return this
  }

  cookie (...cookies) {
    const arr = this._headers['Set-Cookie'] || (this._headers['Set-Cookie'] = [])
    arr.push(...cookies)
    return this
  }

  expires (date = new Date()) {
    this._headers['Expires'] = date.toUTCString()
    return this
  }

  lastModified (date = new Date()) {
    this._headers['Last-Modified'] = date.toUTCString()
    return this
  }

  encoding (encoding) {
    this._encoding = encoding
    return this
  }

  header (key, value) {
    this._headers[key] = value
    return this
  }
}

export class Response {
  constructor (responseBuilder) {
    this.body = {
      status: responseBuilder._status,
      entity: responseBuilder._entity,
      encoding: responseBuilder._encoding
    }
    this.header = responseBuilder._headers
  }

  edit () {
    return Response.fromResponse(this)
  }

  static fromResponse (response) {
    const entity = response.body.entity
    const builder = new ResponseBuilder(response.body.status, MediaType.APPLICATION_JSON, typeof entity === 'object' ? JSON.parse(JSON.stringify(entity)) : entity) // is deep clone really necessary?
    builder._headers = JSON.parse(JSON.stringify(response.header)) // is deep clone really necessary?
    builder._encoding = response._encoding
    return builder
  }

  static accepted (entity = null, mediaType = MediaType.APPLICATION_JSON) {
    return new ResponseBuilder(HttpStatus.ACCEPTED, mediaType, entity)
  }

  static badRequest (entity = null, mediaType = MediaType) {
    return new ResponseBuilder(HttpStatus.BAD_REQUEST, mediaType, entity)
  }

  static noContent (mediaType = MediaType.APPLICATION_JSON) {
    return new ResponseBuilder(HttpStatus.NO_CONTENT, mediaType, null)
  }

  static notFound (entity = null, mediaType = MediaType.APPLICATION_JSON) {
    return new ResponseBuilder(HttpStatus.NOT_FOUND, mediaType, entity)
  }

  static ok (entity = null, mediaType = MediaType.APPLICATION_JSON) {
    return new ResponseBuilder(HttpStatus.OK, mediaType, entity)
  }

  static redirect (uri) {
    return new ResponseBuilder(HttpStatus.MOVED_PERMANENTLY, MediaType.TEXT_HTML, null).header('Location', uri)
  }

  static serverError (entity = null, mediaType = MediaType.APPLICATION_JSON) {
    return new ResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR, mediaType, entity)
  }

  static status (status) {
    return new ResponseBuilder(status, MediaType.APPLICATION_JSON, null)
  }

  static static (file, options) {
    const response = serveStatic(file, options)
    return new ResponseBuilder(response.statusCode, response.mediaType, response.content)
  }

  static get Status () {
    return HttpStatus
  }

  static get MediaType () {
    return MediaType
  }
}
