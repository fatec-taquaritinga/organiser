const expectedResponse = require('../expectedResponse')()

class Foo {
  constructor (message) {
    this.message = message
  }
  bar () {
    return new Promise((resolve) => {
      setTimeout(() => resolve(`${this.message}`), 1)
    })
  }
}

module.exports = function () {
  return new Promise(async (resolve) => {
    const foo = new Foo(expectedResponse)
    resolve(await foo.bar())
  })
}
