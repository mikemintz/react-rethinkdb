# react-rethinkdb tutorial

Example tutorial app using [react-rethinkdb].

## Introduction

This tutorial walks you through creating your first react-rethinkdb app. It
assumes no knowledge of [React] or [RethinkDB], but you should have basic
JavaScript knowledge and ability with the terminal. This will take about an
hour to follow along if you have no React or RethinkDB experience.

The files in this [`examples/tutorial/`] directory represent the end result
react-rethinkdb app of this tutorial. We'll walk you through the steps to
create this app from scratch.

For other react-rethinkdb example apps, see the [`examples/`] directory.


## Prerequisites

You will need a Linux or Mac OS X machine. [RethinkDB doesn't support Windows
yet], so if you're unable to install RethinkDB in your development environment,
you'll need to [deploy RethinkDB elsewhere].

You will need to install node.js, npm, and RethinkDB.

### Homebrew

If you use Mac OS X, the simplest way to install the prerequisites is via
[Homebrew]. The linked webpage gives installation instructions.

If you have any issues installing dependencies, you may also need to install
[Xcode].

If you use Linux, you're probably already familiar with the package manager
that comes with your distribution.

### node.js and npm

[Node.js] is a JavaScript environment that runs outside the browser. We will need
it to run the build tools necessary to create a react-rethinkdb app, as well as
to proxy requests from the browser to the database.

[Npm] is the de facto package manager for node.js packages, which we will need to
manage our third-party JavaScript dependencies.

To install node.js and npm, run the following command in your terminal:

| OS              | Command                                         |
| --------------- | ----------------------------------------------- |
| Mac OS X        | `brew install node`                             |
| Arch Linux      | `sudo pacman -S nodejs npm`                     |
| Debian / Ubuntu | `sudo apt-get install nodejs npm`               |
| Fedora          | `sudo yum install nodejs npm`                   |
| RHEL / CentOS   | `sudo yum install nodejs npm --enablerepo=epel` |

### RethinkDB

[RethinkDB] is an open-source NoSQL database that we will use to store and query
data on the server.

To install RethinkDB, run the following command in your terminal:

| OS         | Command                            |
| ---------- | ---------------------------------- |
| Mac OS X   | `brew install rethinkdb`           |
| Arch Linux | `sudo pacman -S rethinkdb`         |
| Other      | http://rethinkdb.com/docs/install/ |


## Set up npm package

Now that we have our prerequisites, we will set up our app as an npm package.

In your terminal, create an empty directory for your project, and initialize an
npm package:

```
$ mkdir react-rethinkdb-tutorial
$ cd react-rethinkdb-tutorial
$ npm init
This utility will walk you through creating a package.json file.
...
name: (react-rethinkdb-tutorial)
version: (1.0.0) 0.1.0
description: Example tutorial app using react-rethinkdb
entry point: (index.js) server/index.js
test command:
git repository:
keywords:
author:
license: (ISC)
About to write to /path/to/react-rethinkdb-tutorial/package.json:

...
Is this ok? (yes)
```

That command generated a `./package.json` file, which describes our npm
package.


## Install npm dependencies

We're going to need a few third-party JavaScript libraries to get started.
We'll use the `npm install` command to download them, and they'll go in a
directory called `./node_modules/`. If you are using version control like git
or hg, you will want to exclude that directory from your repository.

### Server-side dependencies

Run the command below to
* install [Express], the web server library we'll use to serve requests
* install [rethinkdb-websocket-server], the library we'll use to proxy database
  queries from the browser to the RethinkDB instance

`$ npm install express rethinkdb-websocket-server --save`

### Client-side dependencies

Run the command below to
* install [React], the JavaScript library we're using to build our UI
* install [react-rethinkdb], the library we'll use to subscribe to database
  queries from our React app

`$ npm install react react-rethinkdb --save`

### Build tools

Run the command below to
* install [webpack], the bundler we'll use to generate a JavaScript source file
  that the browser can download and use
* install [babel], the JavaScript compiler we'll use to write modern ES2015
  JavaScript and JSX in our app (the babel-loader module adds webpack support)

`$ npm install webpack babel-core babel-loader --save-dev`


## Set up RethinkDB

In another terminal, run `rethinkdb`. This will start a RethinkDB server
locally on port 28015. It creates a `./rethinkdb_data/` directory wherever you
are, which you should exclude from version control.

If you open http://localhost:8080/ you will see the RethinkDB administration
console. In the Tables section, make sure you have a database called `test`
with a table called `turtles`. We will use this table for our app.

If you want to play around a bit, go to the Data Explorer section, and you can
manually issue [RethinkDB queries]. Here are some examples:

```js
// List all rows from the 'turtles' table
r.table('turtles')

// Insert a row in the 'turtles' table with 'firstName' set to 'Anna'
r.table('turtles').insert({firstName: 'Anna'})

// List the first 5 ids from 'turtles' with a firstName that ends in 'ny'
// ordered alphabetically by 'firstName'
r.table('turtles')
 .filter(r.row('firstName').match('ny$'))
 .orderBy('firstName')
 .limit(5)
 .pluck('id')
```


## Create the server-side app

### Create index.js script

We're going to create a script called `./server/index.js` that runs our
webserver. Copy/paste this into your text editor, and read the comments that
describe what's happening:

```js
// Import third-party libraries (managed by npm)
var express = require('express');
var http = require('http');
var RethinkdbWebsocketServer = require('rethinkdb-websocket-server');

// Set up an HTTP route to serve files from assets/
var app = express();
app.use('/', express.static('assets'));
var httpServer = http.createServer(app);

// Configure rethinkdb-websocket-server to listen on the /db path and proxy
// incoming WebSocket connections to the RethinkDB server running on localhost
// port 28015. Because unsafelyAllowAnyQuery is true, any incoming query will
// be accepted (not safe in production).
RethinkdbWebsocketServer.listen({
	httpServer: httpServer,
	httpPath: '/db',
	dbHost: 'localhost',
	dbPort: 28015,
	unsafelyAllowAnyQuery: true,
});

// Start the HTTP server on port 8015
httpServer.listen(8015);
console.log('Tutorial server started');
```

Note that this does not validate queries, so it would not be safe to run in
production. To learn about query validation, read up on the `queryWhitelist`
option in [rethinkdb-websocket-server]. The [`examples/chat/`] app is a good
example of securely validating queries on the server-side.


### Add npm start script

We're going to configure npm to start the web server when we run `npm start`.

Open `./package.json` in a text editor. Find the section that specifies
`"scripts"`, it will look something like this:

```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

We're going to remove the empty `"test"` script, and add a `"start"`
script that runs `server/index.js`. Your scripts section should now look like
this:

```
  "scripts": {
    "start": "node server/index.js"
  },
```


## Set up webpack

### Add npm postinstall script

We're going to configure npm to spawn webpack.

Open `./package.json` in a text editor again, and add a `"postinstall"` script
that runs the webpack bundler. Your scripts section should now look like this (don't forget the comma):

```
  "scripts": {
    "start": "node server/index.js",
    "postinstall": "webpack"
  },
```

### Add webpack config

Webpack requires a config file. Create a new file called `./webpack.config.js`
that looks like this:

```
module.exports = {
  entry: ['./client/app.jsx'],
  output: {
    path: __dirname,
    filename: 'assets/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: __dirname + '/client'
      }
    ]
  }
};
```

This specifies that webpack should:
* Find the main frontend script at `./client/app.jsx`
* Output a `./assets/bundle.js` JavaScript file for the browser. You should
  exclude this from version control.
* Use babel to compile all `.js` and `.jsx` files in `./client`


## Create the client-side app

### Create index.html entry point

Create a file called `./assets/index.html` with the following content:

```html
<html>
  <body>
    <div id="app"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

When we run `npm start`, this file will be served at http://localhost:8015/
because of how we set up our web server.

It loads `bundle.js`, which will contain all of our client side JavaScript.
This file is generated by webpack when we run `npm start`.

It creates an empty `<div>` tag with `id="app"`, which we'll use to render our
top-level React component.

### Create app.jsx script

We're going to create a script called `./client/app.jsx` that defines our React
app. Copy/paste the contents below into your text editor, and read the comments
that describe what's happening.

You may want to read up on [RethinkDB queries] if you're unfamiliar with the ReQL
syntax below, e.g. `r.table('turtles').insert(...)`.

And you may want to read the[React tutorial] if you're unfamiliar with
React concepts, e.g. `React.createClass`, `render()`, `props`, `state`, and JSX
syntax.

```js
// Import third-party libraries (managed by npm and webpack)
var React = require('react');
var ReactRethinkdb = require('react-rethinkdb');
var r = ReactRethinkdb.r;

// Open a react-rethinkdb session (a WebSocket connection to the server)
ReactRethinkdb.DefaultSession.connect({
  host: 'localhost', // hostname of the websocket server
  port: 8015,        // port number of the websocket server
  path: '/db',       // HTTP path to websocket route
  secure: false,     // set true to use secure TLS websockets
  db: 'test',        // default database, passed to rethinkdb.connect
});

// Create our React component
var App = React.createClass({

  // Enable RethinkDB query subscriptions in this component
  mixins: [ReactRethinkdb.DefaultMixin],

  // Define the RethinkDB queries this component subscribes to.
  //
  // In this case, there is only one query with the key 'turtles', which runs
  // the query r.table('turtles') with a realtime changefeed. This just lists
  // all of the rows in the turtles table. In the render() function,
  // this.data.turtles will be populated with a QueryResult for this query.
  //
  // When this component is mounted or it has new props or state, the observe()
  // function will be re-evaluated. If the result has changed (or it's called
  // for the first time), the resulting queries will be executed and this
  // component will subscribe to the results.
  observe: function(props, state) {
    return {
      turtles: new ReactRethinkdb.QueryRequest({
        query: r.table('turtles'), // RethinkDB query
        changes: true,             // subscribe to realtime changefeed
        initial: [],               // return [] while loading
      }),
    };
  },

  // This is called when the <form> in render() is submitted by the browser. It
  // grabs the text field value and runs a RethinkDB query to insert a new row.
  handleSubmit: function(event) {
    event.preventDefault();
    var nameInput = React.findDOMNode(this.refs.firstName);
    var query = r.table('turtles').insert({firstName: nameInput.value});
    nameInput.value = '';
    ReactRethinkdb.DefaultSession.runQuery(query);
  },

  // This is the standard React render function, which returns the rendered JSX
  // definition for this component. Because we added the ReactRethinkdb mixin
  // and defined an observe() function, we can reference this.data to display
  // the results of our subscribed queries.
  //
  // The crazy looking HTML-inside-JavaScript syntax below is JSX, which babel
  // compiles down to ordinary JavaScript. The curly braces allow us
  // interpolate arbitrary JavaScript expressions inside our JSX.
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

// Render the App component into the <div id="app"> element on index.html
React.render(<App />, document.getElementById('app'));
```


## Launch the app

To launch the app, there are 4 steps:

### Compile the frontend

Anytime the client source code changes, run `npm install` to rebuild
`./assets/bundle.js`

### Start RethinkDB

If RethinkDB isn't already running, run `rethinkdb` in the terminal.

### Start the web server

To start the web server, run `npm start` in the terminal

### Open in browser

To use the app, visit http://localhost:8015/ in your web browser. If you open
two browsers, you can see both update in realtime when you add a new turtle.


## You're done!

If you want to learn how to set up more sophisticated react-rethinkdb apps, see
the [`examples/`] directory. The examples show more modular React components,
more types of RethinkDB queries, backend query validation, and user auth.

[babel]: https://babeljs.io/
[deploy RethinkDB elsewhere]: http://www.rethinkdb.com/docs/paas/
[`examples/`]: https://github.com/mikemintz/react-rethinkdb/tree/master/examples
[`examples/tutorial/`]: https://github.com/mikemintz/react-rethinkdb/tree/master/examples/tutorial
[`examples/chat/`]: https://github.com/mikemintz/react-rethinkdb/tree/master/examples/chat
[Express]: http://expressjs.com/
[Homebrew]: http://brew.sh/
[Node.js]: http://nodejs.org/
[Npm]: https://www.npmjs.com/
[react-rethinkdb]: https://github.com/mikemintz/react-rethinkdb
[React]: https://facebook.github.io/react/
[React tutorial]: http://facebook.github.io/react/docs/tutorial.html
[RethinkDB]: http://rethinkdb.com/
[RethinkDB doesn't support Windows yet]: https://github.com/rethinkdb/rethinkdb/issues/1100
[RethinkDB queries]: http://rethinkdb.com/docs/introduction-to-reql/
[rethinkdb-websocket-server]: https://github.com/mikemintz/rethinkdb-websocket-server
[webpack]: http://webpack.github.io/
[Xcode]: https://itunes.apple.com/us/app/xcode/id497799835?mt=12
