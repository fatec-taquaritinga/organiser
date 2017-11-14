
---

<div align="center">
  <img src="https://raw.githubusercontent.com/fatec-taquaritinga/organiser/master/media/logo.svg?sanitize=true" alt="OrganiserJS" /><br />
</div>

---

# Context

Type: `object`

There is a Context when there is a Method Resolver. You can interact with the Context object with modifiers.

You can't set a new value to a Context's property, but you can modify any object of a Context's property.

**instance**

Type: [`Server`](./Server.md)

**request**

Type: [`http.ClientRequest`](https://nodejs.org/api/http.html#http_class_http_clientrequest)

**response**

Type: [`http.ServerResponse`](https://nodejs.org/api/http.html#http_class_http_serverresponse)

**timing**

Type: [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

**data**
Type: [`ContextData`](./context/ContextData.md)

