import 'babel-polyfill'
import HttpStatus from './status'
import MediaType from './mediaType'
import serveStatic from './static'

export { MediaType, HttpStatus }

export class ResponseBuilder {
  constructor (statusCode, mediaType, entity) {
    this.status = statusCode
    this.entity = entity
    this._encoding = 'utf8'
    this.headers = {
      'Content-Type': mediaType
    }
  }

  build () {
    return new Response(this)
  }

  status (status) {
    this.status = status
    return this
  }

  entity (entity) {
    this.entity = entity
    return this
  }

  type (mediaType) {
    this.headers['Content-Type'] = mediaType
    return this
  }

  cookie (...cookies) {
    if (!this.headers['Set-Cookie']) this.headers['Set-Cookie'] = []
    this.headers['Set-Cookie'].push(...cookies)
    return this
  }

  expires (date = new Date()) {
    this.headers['Expires'] = date.toUTCString()
    return this
  }

  lastModified (date = new Date()) {
    this.headers['Last-Modified'] = date.toUTCString()
    return this
  }

  encoding (encoding) {
    this._encoding = encoding
    return this
  }

  header (key, value) {
    this.headers[key] = value
    return this
  }
}

export class Response {
  constructor (responseBuilder) {
    this.body = {
      status: responseBuilder.status,
      entity: responseBuilder.entity,
      encoding: responseBuilder._encoding
    }
    this.header = responseBuilder.headers
  }

  edit () {
    return Response.fromResponse(this)
  }

  static fromResponse (response) {
    const builder = new ResponseBuilder(response.body.status, MediaType.APPLICATION_JSON, JSON.parse(JSON.stringify(response.body.entity))) // is deep clone really necessary?
    builder.headers = JSON.parse(JSON.stringify(response.header)) // is deep clone really necessary?
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

  static async static (file) {
    const response = await serveStatic(file)
    return new ResponseBuilder(response.statusCode, response.mediaType, response.content)
  }

  static get Status () {
    return HttpStatus
  }

  static get MediaType () {
    return MediaType
  }
}
