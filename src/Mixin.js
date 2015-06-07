'use strict';

import {QueryResult} from './QueryResult';
import {Session, DefaultSession} from './Session';
import {ensure} from './util';

const update = (component, props, state) => {
  const observed = component.observe(props, state);
  const {session, subscriptions} = component._rethinkMixinState;
  const subscriptionManager = session._subscriptionManager;

  // Close subscriptions no longer subscribed to
  Object.keys(subscriptions).forEach(key => {
    if (!observed[key]) {
      subscriptions[key].unsubscribe();
      delete component.data[key];
    }
  });

  // [Re]-subscribe to active queries
  Object.keys(observed).forEach(key => {
    const queryRequest = observed[key];
    const oldSubscription = subscriptions[key];
    const queryResult = component.data[key] || new QueryResult(queryRequest.initial);
    subscriptions[key] = subscriptionManager.subscribe(component, queryRequest, queryResult);
    component.data[key] = queryResult;
    if (oldSubscription) {
      oldSubscription.unsubscribe();
    }
  });
};

const unmount = component => {
  const {subscriptions} = component._rethinkMixinState;
  Object.keys(subscriptions).forEach(key => {
    subscriptions[key].unsubscribe();
  });
};

// Mixin for RethinkDB query subscription support in React components. You'll
// generally want to use DefaultMixin or PropsMixin, which use BaseMixin to
// create more usable versions.
//
// In your component, you should define an observe(props, state) method that
// returns an object mapping query names to QueryRequests. See
// QueryRequest.js for the API.
//
// In the render() function, you will have access to this.data, which is an
// object mapping from the same query names returned in observe() to the
// results of each query as an QueryResult. See QueryResult.js for the
// API.
//
// Here is a simple example of the mixin API:
//   var App = React.createClass({
//     mixins: [DefaultMixin],
//
//     observe: function(props, state) {
//       return {
//         turtles: new QueryRequest({
//           query: r.table('turtles'),
//           changes: true,
//           initial: [],
//         }),
//       };
//     },
//
//     render: function() {
//       return <div>
//         {this.data.turtles.value().map(function(x) {
//           return <div key={x.id}>{x.firstName}</div>;
//         })};
//       </div>;
//     },
//   });
export const BaseMixin = sessionGetter => ({
  componentWillMount() {
    const componentName = this && this.constructor && this.constructor.displayName || '';
    const session = sessionGetter(this);
    ensure(session instanceof Session, `Mixin in ${componentName} does not have Session`);
    ensure(this.observe, `Must define ${componentName}.observe()`);
    ensure(session._connPromise, `Must connect() before mounting ${componentName}`);
    this._rethinkMixinState = {session, subscriptions: {}};
    this.data = this.data || {};
    update(this, this.props, this.state);
  },

  componentWillUnmount() {
    unmount(this);
  },

  componentWillUpdate(nextProps, nextState) {
    if (nextProps !== this.props || nextState !== this.state) {
      update(this, nextProps, nextState);
    }
  },
});

// Singleton mixin for convenience, which uses the DefaultSession singleton as
// the session.
export const DefaultMixin = BaseMixin(() => DefaultSession);

// Mixin that uses rethink session from props. For example:
//   var MyComponent = React.createClass({
//     mixins: [PropsMixin('rethinkSession')],
//     ...
//   });
//   var session = new Session();
//   React.render(<MyComponent rethinkSession={session} />, mountNode);
export const PropsMixin = name => BaseMixin(component => component.props[name]);
