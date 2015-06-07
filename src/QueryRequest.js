'use strict';

// An QueryRequest is used to represent a RethinkDB query that a component is
// subscribed to. It should be used for values in the object returned from the
// observe() function of components that use the provided mixin. See Mixin.js
// for the API.
//
// QueryRequests have have 3 required properties.
// * query:   the RethinkDB query to run
// * changes: boolean specifying whether to subscribe to the realtime
//            changefeed too
// * initial: value to be returned before the query finishes loading
//
// Here is a simple example of an QueryRequest that a component might use in
// its observe() function:
//   new QueryRequest({
//     query: r.table('turtles'),
//     changes: true,
//     initial: [],
//   })
export class QueryRequest {
  constructor({query, changes, initial}) {
    this.query = query;
    this.changes = changes;
    this.initial = initial;
  }

  // Convert the QueryRequest into a string that can be used as a
  // deterministic lookup key in an object. The key should be identical for two
  // QueryRequests that need access to the same data.
  //
  // TODO We should recursively sort object keys, using something like
  // json-stable-stringify. But let's do that for query validation in
  // rethinkdb-websocket-server first, after confirming that object sort order is
  // ignored in RethinkDB.
  //
  // TODO This isn't perfectly deterministic for queries with anonymous
  // functions, since the variable identifier keeps incrementing when we create
  // new "identical" queries.
  // E.g. r.table('turtles').filter(x => x('herdId').eq(props.herdId))
  toStringKey() {
    return JSON.stringify({
      query: this.query.build(),
      changes: this.changes,
    });
  }
}
