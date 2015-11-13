import {ensure} from './util';
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
// Call onceDoneLoading() with a callback to be notified when there are no
// active queries waiting on results.
//
// You may reopen a closed session. A typical use case is to have one session
// per application (likely DefaultSession), to call connect() when the user
// authenticates (including authentication information in the path), and
// close() when the user signs out.
//
// The exported MetaSession function allows dependency injection of
// RethinkdbWebsocketClient, so that we can the resulting Session class work in
// either node.js or the browser.

export const MetaSession = RethinkdbWebsocketClient => {
  const {Promise, connect} = RethinkdbWebsocketClient;
  return class Session {
    constructor() {
      const runQueryFn = this.runQuery.bind(this);
      this._connPromise = null;
      this._subscriptionManager = new SubscriptionManager(runQueryFn);
    }

    connect({host, port, path, secure, db, simulatedLatencyMs, autoReconnectDelayMs}) {
      ensure(!this._connPromise, 'Session.connect() called when connected');
      const connectAfterDelay = delayMs => {
        const wsProtocols = ['binary']; // for testing with websockify
        const options = {host, port, path, wsProtocols, secure, db, simulatedLatencyMs};
        this._connPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            connect(options).then(resolve, reject);
          }, delayMs);
        });
        const onClose = () => {
          this._subscriptionManager.handleDisconnect();
          // Don't trigger on client initiated Session.close()
          if (this._connPromise) {
            console.warn('RethinkDB WebSocket connection failure.',
                         `Reconnecting in ${autoReconnectDelayMs}ms`);
            connectAfterDelay(autoReconnectDelayMs);
          }
        };
        if (autoReconnectDelayMs !== undefined) {
          this._connPromise.then(conn => conn.on('close', onClose), onClose);
        }
        this._connPromise.then(() => this._subscriptionManager.handleConnect());
      };
      connectAfterDelay(0);
    }

    close() {
      ensure(this._connPromise, 'Session.close() called when not connected');
      this._connPromise.then(conn => conn.close());
      this._connPromise = null;
    }

    runQuery(query) {
      ensure(this._connPromise, 'Must connect() before calling runQuery()');
      // Rather than calling query.run(c), we create a new rethinkdb term and
      // use its run function. That way, if the provided query comes from a
      // different RethinkdbWebsocketClient, it'll run using the current
      // environment. This is mainly to workaround an instanceof check in the
      // rethinkdb driver.
      const {run} = new RethinkdbWebsocketClient.rethinkdb(null);
      return this._connPromise.then(c => run.bind(query)(c));
    }

    onceDoneLoading(callback) {
      this._subscriptionManager.onceDoneLoading(callback);
    }
  };
};
