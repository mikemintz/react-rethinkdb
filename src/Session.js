'use strict';

import {ensure} from './util';
import {Promise, connect as wsConnect} from 'rethinkdb-websocket-client';
import {SubscriptionManager} from './SubscriptionManager';

// A Session encapsulates a RethinkDB connection and active queries that React
// components are currently subscribed to. You can have multiple independent
// Sessions (useful for isomorphic apps), or you can use the DefaultSession
// singleton for convenience. Each rethink mixin must be associated with a
// Session. The DefaultMixin singleton is associated with DefaultSession.
//
// Call connect() to open a RethinkDB websocket connection, and close() to
// disconnect. Call runQuery() to run a RethinkDB query on the connection,
// returning a Promise with the results. You must call connect() before calling
// runQuery() or mounting a component using a mixin for this session. You do
// not have to wait for it to finish connecting, as it will automatically wait
// on the connection promise.
//
// You may reopen a closed session. A typical use case is to have one session
// per application (likely DefaultSession), to call connect() when the user
// authenticates (including authentication information in the path), and
// close() when the user signs out.

export class Session {
  constructor() {
    const runQueryFn = this.runQuery.bind(this);
    this._connPromise = null;
    this._subscriptionManager = new SubscriptionManager(runQueryFn);
  }

  connect({host, port, path, secure, db}) {
    ensure(!this._connPromise, 'Session.connect() called when connected');
    this._connPromise = new Promise((resolve, reject) => {
      const wsProtocols = ['binary']; // for testing with websockify
      const options = {host, port, path, wsProtocols, secure, db};
      wsConnect(options).then(resolve, reject);
    });
  }

  close() {
    ensure(this._connPromise, 'Session.close() called when not connected');
    this._connPromise.then(conn => conn.close());
    this._connPromise = null;
  }

  runQuery(query) {
    ensure(this._connPromise, 'Must connect() before calling runQuery()');
    return this._connPromise.then(c => query.run(c));
  }
}

export const DefaultSession = new Session();
