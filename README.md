[![npm version](https://img.shields.io/npm/v/react-rethinkdb.svg)](https://www.npmjs.com/package/react-rethinkdb)

# react-rethinkdb

Render realtime RethinkDB results in React

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

|                   | React support  | Database    | Realtime | Open-source |
| ---------------   | -------------  | ----------- | ---------| ------------|
| [react-rethinkdb] | &#x2713;       | [RethinkDB] | &#x2713; | &#x2713;    |
| [Meteor]          | [react-meteor] | [MongoDB]   | &#x2713; | &#x2713;    |
| [Parse]           | [ParseReact]   | [MongoDB]   |          |             |
| [Firebase]        | [ReactFire]    | [MongoDB]   | &#x2713; |             |

## What is React?

[React] is a JavaScript library for building user interfaces. It's pretty cool.

This library only works with React by design. If you are interested in
connecting to RethinkDB from the browser without React, you can use
[rethinkdb-websocket-client].

## What is RethinkDB?

[RethinkDB] is an open-source NoSQL database with baked in realtime
capabilities. It is quite popular, it is the second most starred database on
GitHub after Redis.

## How do I use this?

Check out the [`examples/`] folder in this repository for fully-working React
applications. You will need to [install RethinkDB] first if you haven't
already.

You can also peruse the comments in the source code in the [`src/`] directory:
* [`Session.js`] to create a new websocket connection to the backend/database
* [`Mixin.js`] to enable a React component to subscribe to RethinKDB queries
* [`QueryRequest.js`] to configure queries in subscribed React components
* [`QueryResult.js`] to use results from queries in `render()`

Below is a very simple React application to give an idea of the syntax:

```js
var React = require('react');
var ReactRethinkdb = require('react-rethinkdb');
var r = ReactRethinkdb.r;

ReactRethinkdb.DefaultSession.connect({
  host: 'localhost', // hostname of the websocket server
  port: 8015,        // port number of the websocket server
  path: '/',         // HTTP path to websocket route
  secure: false,     // set true to use secure TLS websockets
  db: 'test',        // default database, passed to rethinkdb.connect
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
    var nameInput = React.findDOMNode(this.refs.firstName);
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

React.render(<App />, document.getElementById('app'));
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

## Roadmap

* Investigate browser compatibility. So far I've only tested in chrome.
* Investigate performance. I haven't tested with large queries, large numbers
  of queries, or large result sets.
* Change mixin API when best practices are established for data loading in React.
    - https://github.com/facebook/react/issues/3398
    - https://github.com/facebook/react/issues/3858
    - https://github.com/facebook/react/pull/3920
* Support for [React components written as ES6 classes]
* [React Native] support (currently completely untested)
* Isomorphic app support (currently completely untested)
    * This might be tricky for queries with changefeeds unless we require the
      browser to rerun the query. But then we might have an extra loading
      flicker
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
[`src/`]: src/
[`Session.js`]: src/Session.js
[`Mixin.js`]: src/Mixin.js
[`QueryRequest.js`]: src/QueryRequest.js
[`QueryResult.js`]: src/QueryResult.js

[Firebase]: https://www.firebase.com/
[Meteor]: https://www.meteor.com/
[MongoDB]: https://www.mongodb.org/
[ParseReact]: https://www.firebase.com/docs/web/libraries/react/
[Parse]: https://parse.com/
[React Native]: https://facebook.github.io/react-native/
[React components written as ES6 classes]: https://facebook.github.io/react/docs/reusable-components.html#es6-classes
[ReactFire]: https://www.firebase.com/docs/web/libraries/react/
[React]: https://facebook.github.io/react/
[Reqlite]: https://github.com/neumino/reqlite
[RethinkDB]: http://rethinkdb.com/
[install RethinkDB]: http://rethinkdb.com/docs/install/
[react-meteor]: https://github.com/reactjs/react-meteor
[react-rethinkdb]: https://github.com/mikemintz/react-rethinkdb
[rethinkdb-websocket-client]: https://github.com/mikemintz/rethinkdb-websocket-client
[rethinkdb-websocket-server]: https://github.com/mikemintz/rethinkdb-websocket-server
