import mime from 'mime'
import fs from 'fs'
import HttpStatus from './status'
import MediaType from './mediaType'

const cache = {}

export default function (file) {
  return new Promise(resolve => {
    let cached = cache[file]
    if (cached) {
      resolve({
        statusCode: HttpStatus.OK,
        mediaType: cached.type,
        content: cached.content
      })
    } else {
      fs.readFile(file, (err, data) => {
        if (err) {
          // TODO improve error handling
          resolve({
            statusCode: HttpStatus.NO_CONTENT,
            mediaType: MediaType.APPLICATION_JSON,
            content: null
          })
        } else {
          cached = (cache[file] = { content: (file), type: mime.lookup(file) })
          resolve({
            statusCode: HttpStatus.OK,
            mediaType: cached.type,
            content: cached.content
          })
        }
      })
    }
  })
}
