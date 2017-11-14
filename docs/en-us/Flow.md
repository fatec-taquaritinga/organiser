
---

<div align="center">
  <img src="https://raw.githubusercontent.com/fatec-taquaritinga/organiser/master/media/logo.svg?sanitize=true" alt="OrganiserJS" /><br />
</div>

---

# Flow

This is how Organiser's request handling is called. It is composed by [_Flow Modifiers_](./flow/FlowModifier.md) and a [_Method Resolver_](./flow/MethodResolver.md). If there are no [_anomallies_](./flow/FlowAnomally.md), it is supposed to work this way:

<div align="center">

`(1) SM → (2) RM → (3) Method Resolver → (4) RM → (5) SM`
</div>

> _`SM`: Server Modifiers_
> _`RM`: Route Modifiers_

###### (1) Request received

When a new request is made to Organiser, it runs Server Modifiers that executes **before** resolving the request's route. In other words, there is no [`Context`](./Context.md) at this time.

###### (2) Matching [_Method Resolver_](./flow/MethodResolver.md)

Organiser tries to look up for a Method Resolver that matches the requested URL and its HTTP method.

If true, a [`Context`](./Context.md) object is created and the first [_Route Modifiers_](./flow/FlowModifier.md) are executed.

At this moment, if any [_Route Modifier_](./flow/FlowModifier.md) returns an object or no related Method Resolvers were found, Flow skips to `(5) Ending request` and takes the object, if exists, as the final response.

> Subsequent [_Route Modifiers_](./flow/FlowModifier.md) to the one that returned an object are not executed.

###### (3) Resolving [_Method Resolver_](./flow/MethodResolver.md)

This is the moment when the logic attributed to the requested route is executed. It must return a valid [`Response`](./Response.md) object.

###### (4) Final [_Route Modifiers_](./flow/FlowModifier.md)

From this very moment, [_modifiers_](./flow/FlowModifier.md) can now modify the response acquired from the [_Method Resolver_](./flow/MethodResolver.md). Returning a new [`Response`](./Response.md) object also does **not** prevent subsequent [_modifiers_](./flow/FlowModifier.md) from being executed anymore.

> Subsequent [_modifiers_](./flow/FlowModifier.md) can also modify previous [`Response`](./Response.md) objects.

###### (5) Ending request

The last [_Server Modifiers_](./flow/FlowModifier.md) are executed. If there is a [`Context`](./Context.md), then there is a [`Response`](./Response.md) object. 

> Returning a new [`Response`](./Response.md) object does **not** prevent subsequent [_modifiers_](./flow/FlowModifier.md) from being executed.

The final [`Response`](./Response.md) object is sent to the user.