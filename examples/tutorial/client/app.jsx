// Import third-party libraries (managed by npm and webpack)
var React = require('react');
var ReactDOM = require('react-dom');
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
    var nameInput = this.refs.firstName;
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
ReactDOM.render(<App />, document.getElementById('app'));
