# example-isomorphic

Example isomorphic app using react-rethinkdb. The DOM will be pre-rendered on
the server in node.js, and then rendered again in the browser.

## How do I run this?

* Make sure you have `node_modules/.bin` in your `$PATH` environment variable
* Start a RethinkDB server on `localhost` port `28015`
* Manually create a table called `turtles` in the db called `test`, and add a
  row or two with a name field
* Run `npm install` to set up the app
* Run `npm start` to start the web server
* Navigate to http://localhost:8015/ in your browser

## Limitations

There are still limitations in react-rethinkdb's isomorphic support that need
to get sorted out:

* The server does not pass down the query state to the browser, so it must
  re-run the queries, which is inefficient and causes a flicker. This is not
  trivial to implement with changefeed queries.
