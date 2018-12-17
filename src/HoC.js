import React from 'react';
import {ensure} from './util';
import {update, unmount} from './Mixin';

// Mixin for RethinkDB query subscription support in React components. You'll
// generally want to use DefaultHoC or PropsHoC, which use BaseHoC to
// create more usable versions.
//
// Along with your component, you should pass an observe(props, state) function that
// returns an object mapping query names to QueryRequests. See
// QueryRequest.js for the API.
//
// In the child component, you will have access to this.props.data, which is an
// object mapping from the same query names returned in observe() to the
// results of each query as an QueryResult. See QueryResult.js for the
// API.
//
// Here is a simple example of the mixin API:
// const observe = (props) => ({
//     turtles: new QueryRequest({
//       query: r.table('turtles'),
//       changes: true,
//       initial: [],
//     }),
//   });

// class App extends Component {
//   render() {
//     return <div>
//       {this.props.data.turtles.value().map(function(x) {
//         return <div key={x.id}>{x.firstName}</div>;
//       })};
//     </div>;
//   },
// };

// BaseHoC(() => new Session())(observe)(App);

export const BaseHoC = sessionGetter => observe => ChildComponent => class ReactRethinkDB extends React.Component {
  constructor(props) {
    super();
    this.observe = observe;
  }

  componentWillMount() {
    const session = sessionGetter(this);
    this.runQuery = session.runQuery.bind(session);
    ensure(session && session._subscriptionManager, 'Must define Session');
    ensure(this.observe, 'Must define observe()');
    ensure(session._connPromise, 'Must connect() before mounting react-rethinkdb');
    this._rethinkMixinState = {session, subscriptions: {}};
    this.data = this.data || {};
    update(this, this.props);
  }

  componentDidMount() {
    this._rethinkMixinState.isMounted = true;
  }

  componentWillUnmount() {
    unmount(this);
    this._rethinkMixinState.isMounted = false;
  }

  componentWillUpdate(nextProps) {
    if (nextProps !== this.props) {
      update(this, nextProps);
    }
  }

  render() {
    return <ChildComponent data={this.data} runQuery={this.runQuery} {...this.props} />;
  }
};

// Within ChildComponent, you can then run queries like this:
// var App = React.createClass({
//   handleSubmit: function(event) {
//     event.preventDefault();
//     var { runQuery } = this.props
//     var nameInput = this.refs.firstName;
//     var query = r.table('turtles').insert({firstName: nameInput.value});
//     nameInput.value = '';
//     runQuery(query);
//   },

//   render: function() {
//     var turtleDivs = this.data.turtles.value().map(function(x) {
//       return <div key={x.id}>{x.firstName}</div>;
//     });
//     return <div>
//       <form onSubmit={this.handleSubmit}>
//         <input type="text" ref="firstName" />
//         <input type="submit" />
//       </form>
//       {turtleDivs}
//     </div>;
//   },
// });

// HoC that uses rethink session from props. For example:
//   class MyComponent extends Component {
//     ...
//   });
//   var session = new Session();
//   React.render(<MyComponent rethinkSession={session} />, mountNode);
export const PropsHoC = name => BaseHoC(component => component.props[name]);
