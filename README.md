[![npm version](https://img.shields.io/npm/v/react-rethinkdb.svg)](https://www.npmjs.com/package/react-rethinkdb)
[![Travis](https://img.shields.io/travis/mikemintz/react-rethinkdb.svg)](https://travis-ci.org/mikemintz/react-rethinkdb)

# react-rethinkdb

Render realtime RethinkDB results in React

### Get started
To get started immediately, follow the [`examples/tutorial/`] project, or clone
some of the other projects in [`examples/`].

## What is this?

This library provides a [React] mixin for running [RethinkDB] queries in any
React component directly from the browser. It wraps
[rethinkdb-websocket-client] to connect to the database, and is intended to be
used with [rethinkdb-websocket-server] running in the backend.

This is similar to solutions like [Meteor], [Parse], and [Firebase]. Rather
than writing database queries in the backend and exposing API endpoints to the
frontend, these solutions allow the frontend to directly access the data layer
(secured by a permission system) using the same query API that backend services
have access to.

|                   | React support                       | Database    | Realtime | Open-source |
| ---------------   | -------------                       | ----------- | ---------| ------------|
| [react-rethinkdb] | &#x2713;                            | [RethinkDB] | &#x2713; | &#x2713;    |
| [Meteor]          | [react-meteor] and [react-packages] | [MongoDB]   | &#x2713; | &#x2713;    |
| [Parse]           | [ParseReact]                        | [MongoDB]   |          |             |
| [Firebase]        | [ReactFire]                         | [MongoDB]   | &#x2713; |             |

## What is React?

[React] is a JavaScript library for building user interfaces. It's pretty cool.

This library only works with React by design. If you are interested in
connecting to RethinkDB from the browser without React, you can use
[rethinkdb-websocket-client].

## What is RethinkDB?

[RethinkDB] is an open-source NoSQL database with baked in realtime
capabilities. It is quite popular, it is the second most starred database on
GitHub after Redis.

## Is this secure?

Although it seems quite insecure to run database queries directly from the
frontend, all queries should be validated by [rethinkdb-websocket-server]
before they are forwarded to RethinkDB. From its README:

> As you are developing, incoming queries that don't validate against the
> whitelist will be logged to console in a format that you can copy and paste
> directly into your JavaScript source file. For dynamic queries, you'll likely
> want to generalize the pattern using `RP.check()` terms, `RP.ref()` terms,
> and the `.validate()` method.

See [`examples/chat/`] for an
example app that has user authentication and query validation in the backend.

Most of the query validation logic can be found in
[`QueryValidator.js`].

## How do I use this?

Check out the [`examples/`] folder in this repository for fully-working React
applications. You will need to [install RethinkDB] version 2.2 or newer first
if you haven't already.

The [`examples/tutorial/`] project has in-depth instructions explaining how to
create a simple app from scratch.

You can also peruse the comments in the source code in the [`src/`] directory:
* [`Session.js`] to create a new websocket connection to the backend/database
* [`Mixin.js`] to enable a React component to subscribe to RethinkDB queries
* [`QueryRequest.js`] to configure queries in subscribed React components
* [`QueryResult.js`] to use results from queries in `render()`

Below is a very simple React application to give an idea of the syntax:

```js
var React = require('react');
var ReactDOM = require('react-dom');
var ReactRethinkdb = require('react-rethinkdb');
var r = ReactRethinkdb.r;

ReactRethinkdb.DefaultSession.connect({
  host: 'localhost',          // hostname of the websocket server
  port: 8015,                 // port number of the websocket server
  path: '/',                  // HTTP path to websocket route
  secure: false,              // set true to use secure TLS websockets
  db: 'test',                 // default database, passed to rethinkdb.connect
  autoReconnectDelayMs: 2000, // when disconnected, millis to wait before reconnect
});

var App = React.createClass({
  mixins: [ReactRethinkdb.DefaultMixin],

  observe: function(props, state) {
    return {
      turtles: new ReactRethinkdb.QueryRequest({
        query: r.table('turtles'), // RethinkDB query
        changes: true,             // subscribe to realtime changefeed
        initial: [],               // return [] while loading
      }),
    };
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var nameInput = this.refs.firstName;
    var query = r.table('turtles').insert({firstName: nameInput.value});
    nameInput.value = '';
    ReactRethinkdb.DefaultSession.runQuery(query);
  },

  render: function() {
    var turtleDivs = this.data.turtles.value().map(function(x) {
      return <div key={x.id}>{x.firstName}</div>;
    });
    return <div>
      <form onSubmit={this.handleSubmit}>
        <input type="text" ref="firstName" />
        <input type="submit" />
      </form>
      {turtleDivs}
    </div>;
  },
});

ReactDOM.render(<App />, document.getElementById('app'));
```

## Features

* Realtime queries with RethinkDB changefeed support
* Share results of identical queries across React components

## Limitations

* RethinkDB changefeeds don't work on aggregations like `.count()`, but it will eventually be supported.
    * https://github.com/rethinkdb/rethinkdb/issues/3735
    * https://github.com/rethinkdb/rethinkdb/issues/1118
* RethinkDB changefeed queries with `.orderBy()` may not be ordered correctly, but it will eventually be possible.
    * https://github.com/rethinkdb/rethinkdb/issues/3714

## Compatibility

So far, this library has been tested successfully in the following environments:
* Chrome 43 (Linux)
* Chrome 43 (Android 5.0)
* Chrome 43 (Android 4.4)
* Chrome 44 (OS X 10.10)
* Firefox 38 (Linux)
* Safari 7.1 (OS X 10.9)
* Safari 8.0 (OS X 10.10)
* Safari 8.0 (iOS 8.1)
* IE11 (Win 7)
* IE10 (Win 7)
* Node.js 0.12 (Linux)

In IE10, your queries must use `r.bracket` instead of function-call shorthand.
E.g. `r.table('turtles').get(id)("name")` must be written as
`r.table('turtles').get(id).bracket("name")`. See
[rethinkdb#162](https://github.com/rethinkdb/rethinkdb/issues/162#issuecomment-119829798)
for more details.

IE9 and old android browsers are not supported because [they don't have
WebSockets](http://caniuse.com/#feat=websockets), and
[rethinkdb-websocket-client] currently requires WebSocket support.

## Upgrade guide

Most new versions of react-rethinkdb are backwards compatible with previous
versions. Below are exceptions with breaking changes:

### Upgrading to 0.5 (from 0.4)

Version 0.5 of react-rethinkdb [saw the introduction of atomic
changefeeds](https://github.com/mikemintz/react-rethinkdb/issues/20), which is
a new feature in [RethinkDB
2.2](https://github.com/rethinkdb/rethinkdb/blob/5b7b03f017d7e4f560aa3cc3f2c286fefeae3dae/NOTES.md).
This simplifies the logic by sending one "atomic" changefeed query, rather than
a static query for initial results followed by a changefeed query for realtime
updates. This saves bandwidth and prevents the race condition where data
changes in between the two queries.

Regular static queries will continue to work the same. But in order to use
react-rethinkdb 0.5 with changefeed queries, you must both:
* Upgrade to RethinkDB 2.2 in your backend.
* Add the `include_initial=true` option to all changefeed queries in your
  rethinkdb-websocket-server query whitelist. Below is an example:

```js
r.table("tortoises")
 .changes({
   includeStates: true,
   includeInitial: true, // this line is now required
 })
 .opt("db", r.db("test")),
```

Or with the old syntax:

```js
RQ(
  RQ.CHANGES(
    RQ.TABLE("tortoises")
  ).opt("include_states", true)
   .opt("include_initial", true) // this line is now required
).opt("db", RQ.DB("test")),
```

## Roadmap

* Investigate performance. I haven't tested with large queries, large numbers
  of queries, or large result sets.
* Change mixin API when best practices are established for data loading in React.
    - https://github.com/facebook/react/issues/3398
    - https://github.com/facebook/react/issues/3858
    - https://github.com/facebook/react/pull/3920
* Support for [React components written as ES6 classes]
* [React Native] support (currently completely untested)
* Isomorphic app support (currently incomplete)
    * This might be tricky for queries with changefeeds unless we require the
      browser to rerun the query. But then we might have an extra loading
      flicker
    * To use on the server in node.js (as opposed to the browser), use the
      following path when importing the module:
      `var ReactRethinkdb = require('react-rethinkdb/dist/node');`
    * See the [`examples/isomorphic/`] directory for example usage
* Query result caching
    - If a component subscribed to a query is unmounted, and a component is
      later mounted with the same exact query, the second component should
      optionally be able to display the cached results.
    - In SubscriptionManager.js, when a component is the last to unsubscribe
      from a query, instead of removing the query state, we would just close
      the query but keep the state around (marked as stale) in case another
      component later subscribes. We may even set a timer before closing the
      query and marking it stale in case it's common for components to quickly
      resubscribe.
    - Components may specify if they are fine with stale results or if they
      need a refresh.
    - We will need an invalidation policy so we don't leak memory.
* Optimistic updates (equivalent to Meteor's latency compensation)
    - [Reqlite] may prove helpful here.

[`examples/`]: examples/
[`examples/chat/`]: examples/chat/
[`examples/isomorphic/`]: examples/isomorphic/
[`examples/tutorial/`]: examples/tutorial/
[`src/`]: src/
[`Session.js`]: src/Session.js
[`Mixin.js`]: src/Mixin.js
[`QueryRequest.js`]: src/QueryRequest.js
[`QueryResult.js`]: src/QueryResult.js
[`QueryValidator.js`]: https://github.com/mikemintz/rethinkdb-websocket-server/blob/master/src/QueryValidator.js

[Firebase]: https://www.firebase.com/
[Meteor]: https://www.meteor.com/
[MongoDB]: https://www.mongodb.org/
[ParseReact]: https://github.com/ParsePlatform/ParseReact
[Parse]: https://parse.com/
[React Native]: https://facebook.github.io/react-native/
[React components written as ES6 classes]: https://facebook.github.io/react/docs/reusable-components.html#es6-classes
[ReactFire]: https://www.firebase.com/docs/web/libraries/react/
[React]: https://facebook.github.io/react/
[Reqlite]: https://github.com/neumino/reqlite
[RethinkDB]: http://rethinkdb.com/
[install RethinkDB]: http://rethinkdb.com/docs/install/
[react-meteor]: https://github.com/reactjs/react-meteor
[react-packages]: https://github.com/meteor/react-packages
[react-rethinkdb]: https://github.com/mikemintz/react-rethinkdb
[rethinkdb-websocket-client]: https://github.com/mikemintz/rethinkdb-websocket-client
[rethinkdb-websocket-server]: https://github.com/mikemintz/rethinkdb-websocket-server
