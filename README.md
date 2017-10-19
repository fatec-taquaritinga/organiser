
---

<div align="center">
  <img src="https://raw.githubusercontent.com/fatec-taquaritinga/organiser/master/media/logo.svg?sanitize=true" alt="OrganiserJS Beta" /><br />
</div>
<div align="center">

[![v1.0.0 - Beta](https://img.shields.io/badge/release-1.0.0-lightgrey.svg?style=flat)](https://www.npmjs.com/package/organiser) [![Beta stage - Not safe for production](https://img.shields.io/badge/stage-beta-orange.svg?style=flat)](https://en.wikipedia.org/wiki/Software_release_life_cycle#Beta) [![StandardJS](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat)](https://standardjs.com/) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/fatec-taquaritinga/organiser/master/LICENSE) [![Stars on Github](https://img.shields.io/github/stars/fatec-taquaritinga/organiser.svg?style=social)](https://github.com/fatec-taquaritinga/organiser)
</div>
<div align="center">

  _An organic web framework for organized web servers._

[upcoming features](https://github.com/fatec-taquaritinga/organiser/projects/3) - [known issues](https://github.com/fatec-taquaritinga/organiser/projects/1#card-5237208) - [send suggestion](https://github.com/fatec-taquaritinga/organiser/issues)
</div>

---

_**Organi**ser_ is a web framework focused on provinding the best developing and maintenance experience, benefiting from Ecmascript's new definitions, with support from [Babel](https://babeljs.io/).

Our goal is having an **organi**zed and **organi**c **ser**ver. But what does that mean?

It means that you can bring complex highly scalable systems to life, with easy maintaining, without having to learn hard syntaxes. It is organized because of its well-known syntax, used in Spring Boot, for example, and it is organic because Organise makes sense: it is just like telling the server what it should do, in almost natural-like language.

Organiser works with _inversion of control_ principles, creating one of the most powerful environments for MVC development in Node.js, for example. Just tell what you want through its _decorators_ and let the magic happen.

---

<div align="center">

⚠️


**Organiser is in beta stage.**
It's not recommended for production usage yet.
</div>

---

1. [Install](https://github.com/fatec-taquaritinga/organiser#install)
2. [Examples](https://github.com/fatec-taquaritinga/organiser#examples)
3. [Events](https://github.com/fatec-taquaritinga/organiser#events)
4. [Modules](https://github.com/fatec-taquaritinga/organiser#modules)
5. [@Arguments - Inversion of Control](https://github.com/fatec-taquaritinga/organiser#arguments---inversion-of-control)
6. [Documentation](https://github.com/fatec-taquaritinga/organiser#documentation)
7. [Team](https://github.com/fatec-taquaritinga/organiser#team)
8. [License](https://github.com/fatec-taquaritinga/organiser#license)

---

### Install

This is a [Node.js](https://nodejs.org/en/) module. Therefore, beforehand, you need to [download and install Node.js](https://nodejs.org/en/download/). Node.js 6.0.0 or higher is required.

Assuming that you have already used the `npm init` command, run:

```bash
$ npm install organiser --save
```

### Examples
- [organiser-helloworld](https://github.com/arthurbergmz/organiser-helloworld)

A server with only a GET endpoint at `localhost:3000` (default) that shows `Hello, world!` as plain text.

  ```javascript
  import { Server, GET, Response, MediaType } from 'organiser'

  class HelloWorld {
    @GET
    async foo () {
      return Response.ok('Hello, world!', MediaType.TEXT_PLAIN).build()
    }
  }

  const server = new Server() // creates a new instance of Organise
  server.routes(HelloWorld) // register controllers, passing their classes by reference
  server.boot() // start server
  ```

- [organiser-agenda](https://github.com/arthurbergmz/organiser-agenda)

Virtual personal agenda, with notes and contacts, using NeDB.

  ```javascript
  import { Server, Modules } from 'organiser'
  import { NotesController } from './controllers/notes'
  import { ContactsController } from './controllers/contacts'

  const server = new Server({
    name: 'Agenda',
    internal: {
      debug: true
    }
  })

  server.modules(Modules.bodyParser())
  server.routes(NotesController, ContactsController)
  server.boot()
  ```

- [organiser-static](https://github.com/arthurbergmz/organiser-static)

Serving static files with Organiser.

  ```javascript
  import { Server, GET, Response } from 'organiser'
  import path from 'path'

  class LandingPage {
    @GET
    async index () {
      return Response.static(path.join(__dirname, '../static/index.html')).build()
    }
  }

  const server = new Server()
  server.routes(LandingPage)
  server.boot()
  ```

### Events

_Work in progress..._

### Modules

You can use how many modules, before and/or after a request, as you wish. We support `context` and `connect` middlewares/modules styles.

Modules defined in `server.modules(module1, module2, module3, ...)` will be executed **before** every controller, in a sequence order (module1 → module2 → module3 → ... → controller). When calling `server.modules()` with parameters, it returns an object containing a function called `after(...)`, that lets you register modules the same way, but they will run **after** every controler. Calling it without parameters will return an object with `before(...)` and `after(...)`.

When you register routes through `server.routes(ControllerClass1, ControllerClass2, ControllerClass3, ...)`, it also returns an object with `before(...)` and `after`, letting you register modules only for the routes passed as parameters.

Using `@ModuleBefore(module1, module2, module3, ...)` and `@ModuleAfter(module4, module5, module6, ...)` above a class or function reproduces the same behavior.

###### Built-in modules

- <span title="Implemented v0.0.1">✔️</span> [Body Parser](#) `Modules.bodyParser(options)`
- <span title="Implemented v0.0.1">✔️</span> [Raw Body Parser](#) `Modules.rawBodyParser(options)`

###### Example

```javascript
import { Server, GET, Response, Modules, ModulesBefore, ModulesAfter } from 'organiser'

function hello (context) {
  return new Promise((resolve) => {
    console.log('hello executed!')
    console.log('You can add properties to the request context and use their values in other modules!')
    context.bye = 'See you!'
    context.luckNumber = Math.floor(Math.random() * 10) + 1
    resolve()
  })
}

function bye (context) {
  return new Promise((resolve) => {
    console.log('bye executed!')
    context.expectedResponse = Response.ok({ bye: context.bye, luckNumber: context.luckNumber }).build()
    resolve()
  })
}

@ModulesBefore(hello)
class Foo {
  @GET
  @ModulesAfter(bye)
  async bar () {
    return Response.ok({ foobar: true }).build()
  }
}

const server = new Server()
server.modules(Modules.bodyParser())
server.routes(Foo).before(
  () => console.log('First module executed!'),
  () => console.log(`Keep going...`)
).after(
  () => console.log('last module executed!')
)
server.boot()
```

_Work in progress..._

### @Arguments - Inversion of Control

Through the **Arguments** decorator, you can inject dependencies anywhere, anytime. Just use the class of the desired instance and Organised will take care of the rest.

When used above classes, the respective class' constructor will be called with the parameters passed through the Arguments decorator.

When used above functions, it only supports one parameters: the data model (object containing properties that Organiser should retrieve). The data model supports inner models (functions returning objects).

###### Example

<table>
<tr>
<td>

```javascript
import { Arguments, Path, PUT, Types } from 'organiser'
import ContactsService from '../services/ContactsService'
import Contact from '../models/Contact'
import logEntity from '../utils/exampleLog'

@Arguments(ContactsService, logEntity)
@Path('contacts')
export class ContactsController {

  constructor (service, entityLogger) {
    this.service = service
    this.logger = entityLogger
  }

  @POST
  @Path('{userId}') // => "/contacts/123"
  @Arguments({
    userId: Types.INTEGER,
    contact: Contact
  })
  async create ({ userId, contact }) { // userId = 123, contact = { ... }
    contact.ownerId = userId
    return Response
            .status(201) // Created
            .entity(this.logger(await this.service.create(contact)))
            .build()
  }

}
```
</td>
<td>
<table>
<tr>
<td>

```javascript
// '../models/Contact'

import { Types } from 'organiser'

export default function Contact () {
  return {
    id: Types.INTEGER,
    name: Types.STRING,
    email: Types.STRING,
    ownerId: Types.INTEGER
  }
}
```
</td>
</tr>
<tr>
<td>

```javascript
// '../utils/exampleLog'

export default function (entity) {
  console.log(entity)
  return entity
}
```
</td>
</tr>
</table>
</td>
</tr>
</table>

- **Contact** is a function that returns an object. This is how you define a model in Organise.
- **ContactsService** is just a regular class, used as a service. You can also use **Arguments** to inject parameters in its constructor (calling other services instances, for example).

Read more about how the **Arguments** decorator works with functions [here](#).

### Documentation

###### Available decorators

- <span title="Implemented v0.0.1">✔️</span> [`Arguments`](#) (accept parameters)
- <span title="Implemented v0.0.1">✔️</span> [`Path`](#) (accept parameters)
- <span title="Implemented v0.0.1">✔️</span> [`ModulesAfter`](#) (accept parameters)
- <span title="Implemented v0.0.1">✔️</span> [`ModulesBefore`](#) (accept parameters)
- <span title="Implemented v0.0.1">✔️</span> [`GET`](#) (functions only)
- <span title="Implemented v0.0.1">✔️</span> [`HEAD`](#) (functions only)
- <span title="Implemented v0.0.1">✔️</span> [`POST`](#) (functions only)
- <span title="Implemented v0.0.1">✔️</span> [`PUT`](#) (functions only)
- <span title="Implemented v0.0.1">✔️</span> [`DELETE`](#) (functions only)
- <span title="Implemented v0.0.1">✔️</span> [`OPTIONS`](#) (functions only)
- <span title="Implemented v0.0.1">✔️</span> [`TRACE`](#) (functions only)
- <span title="Implemented v0.0.1">✔️</span> [`PATCH`](#) (functions only)

###### Model property types

- ️️<span title="Implemented v0.0.1">✔️</span> `Types.UUID`: `'uuid'`
- <span title="Implemented v0.0.1">✔️</span> `Types.STRING`: `'string'`
- <span title="Implemented v0.0.1">✔️</span> `Types.BOOLEAN`: `'boolean'`
- <span title="Implemented v0.0.1">✔️</span> `Types.INTEGER`: `'integer'`
- <span title="Work in progress">🚧</span> `Types.DOUBLE`: `'double'`
- <span title="Work in progress">🚧</span> `Types.FLOAT`: `'float'`
- <span title="Work in progress">🚧</span> `Types.DATE`: `'date'`
- <span title="Work in progress">🚧</span> `Types.FILE`: `'file'`
- <span title="Implemented v0.0.1">✔️</span> `Types.CLIENT_REQUEST`: `'clientRequest'`
- <span title="Implemented v0.0.1">✔️</span> `Types.SERVER_RESPONSE`: `'serverResponse'`

It is encouraged the usage of `Types.*` instead of their respective string version, for versioning purposes.

###### Data models

_Work in progress..._

---

### Team

Created and developed by [Arthur Arioli Bergamaschi](https://github.com/arthurbergmz), supervised by the JavaScript Advanced Core (NAJaS - Núcleo Avançado de JavaScript) at [Fatec Taquaritinga](https://github.com/fatec-taquaritinga).

---

### License

Licensed under [MIT](https://github.com/fatec-taquaritinga/organiser/blob/master/LICENSE).

---

_**Disclaimer:** Organiser is still a work in progress. Methods and behavior can change along the way._