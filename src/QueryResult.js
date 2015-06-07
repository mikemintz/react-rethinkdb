'use strict';

// An QueryResult is used to represent the results returned from the
// RethinkDB database in response to a query. It also keeps track of the state
// of the query, including whether or not it's loading, and if there were any
// errors.
//
// QueryResults are available in this.data for components that use the
// provided mixin. See Mixin.js for the API.
export class QueryResult {
  constructor(initialValue) {
    this._initialValue = initialValue;
    this._unresetValue = undefined;
    this._value = undefined;
    this._loadingInitial = true;
    this._loading = true;
    this._errors = [];
  }

  _reset() {
    this._loading = true;
    this._value = this._initialValue;
    this._errors = [];
  }

  _setValue(value) {
    this._value = value;
    this._unresetValue = value;
    this._loading = false;
    this._loadingInitial = false;
  }

  _setErrors(errors) {
    this._errors = errors;
  }

  // Return the latest result value available from the RethinkDB server. If the
  // query is still loading, return the configured initial value.
  //
  // When the associated QueryRequest changes for a given key returned from
  // observe(), this QueryResult will be loading the updated query. While the
  // updated query is loading, this method will return the configured initial
  // value again. In general, this may result in a flicker as value() changes
  // from the old query results to the initial value to the new query results.
  //
  // One way to avoid the aforementioned flicker is to set the allowStaleQuery
  // option to true. Doing so will have value() return the result of the last
  // successfully loaded query, or the configured initial value if no query has
  // successfully loaded. Thus, when updating an QueryRequest, the value()
  // will remain constant at the old query results until the new query results
  // are available. This option should be used carefully, since the rendered
  // query results may seem inconsistent with the rest of the view. Using the
  // loading() method in the UI should help.
  value({allowStaleQuery = false} = {}) {
    if (allowStaleQuery) {
      return this._loadingInitial ? this._initialValue : this._unresetValue;
    } else {
      return this._loading ? this._initialValue : this._value;
    }
  }

  // Return true if we are waiting to receive the query results from the
  // server, or false if they're already loaded. Note that an QueryResult is
  // only considered loading while it's initializing the results of a query,
  // and that receiving changefeed updates do not set loading back to true.
  //
  // As mentioned in value(), when the QueryRequest is modified, the new
  // query will run and the QueryResult will be considered loading again.
  // Thus loading() will return true if we're waiting on the results of a new
  // query, even if an earlier query successfully loaded earlier.
  //
  // If you set allowStaleQuery=true, this method will only return true if no
  // query has successfully loaded yet. This will return true under the same
  // conditions that value({allowStaleQuery=true}) returns the initial value.
  loading({allowStaleQuery = false} = {}) {
    return allowStaleQuery ? this._loadingInitial : this._loading;
  }

  // Return an array of all errors thrown in the RethinkDB driver API while
  // executing the current QueryRequest. If the QueryRequest changes so
  // that a query is executed again, the errors array is cleared.
  //
  // There are three possible sources of errors:
  // 1. If the query.run() response is rejected by the RethinkDB driver.
  // 2. Same as #1 but for the changefeed query.
  // 3. If an error is ever returned in cursor.each() in the changefeed query.
  errors() {
    return this._errors;
  }
}
