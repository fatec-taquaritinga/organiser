import mime from 'mime'
import fs from 'fs'
import HttpStatus from './status'
import MediaType from './mediaType'

const cache = {}

export default function (file, options) {
  const mediaType = mime.lookup(file)
  return {
    statusCode: HttpStatus.OK,
    mediaType,
    content: (response) => new Promise((resolve) => {
      const cached = cache[file]
      if (cached) {
        resolve(response.edit().entity(cached).build())
      } else {
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) {
            // TODO improve error handling
            resolve(response.edit().status(HttpStatus.NO_CONTENT).type(MediaType.APPLICATION_JSON).entity(null).build())
          } else {
            resolve(response.edit().entity((cache[file] = data)).build())
          }
        })
      }
    })
  }
}
