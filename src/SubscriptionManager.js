import {QueryState} from './QueryState';

// SubscriptionManager tracks active QueryStates, so that two components that
// have identical queries can share a QueryState rather than initiating
// redundant database queries.
//
// The constructor takes a runQuery function from the Session. The subscribe
// method registers a component with a new QueryRequest and an QueryResult
// to write the results into. It returns an object with an unsubscribe() method
// to be called when the component is no longer interested in that
// QueryRequest.
export class SubscriptionManager {
  constructor(runQuery) {
    this.runQuery = runQuery;
    this.queryKeyToState = {};
    this.doneLoadingCallbacks = [];
    this.connectedOnce = false;
  }

  handleConnect() {
    this.connectedOnce = true;
    Object.keys(this.queryKeyToState).forEach(queryKey => {
      const queryState = this.queryKeyToState[queryKey];
      queryState.handleConnect();
    });
  }

  subscribe(component, queryRequest, queryResult) {
    const queryKey = queryRequest.toStringKey();
    let queryState = this.queryKeyToState[queryKey];
    if (!queryState) {
      const onUpdate = () => this._checkDoneLoading();
      const onCloseQueryState = () => {
        delete this.queryKeyToState[queryKey];
      };
      queryState = new QueryState(queryRequest, this.runQuery,
                                  onUpdate, onCloseQueryState);
      if (this.connectedOnce) {
        queryState.handleConnect();
      }
      this.queryKeyToState[queryKey] = queryState;
    }
    const subscription = queryState.subscribe(component, queryResult);
    return {
      unsubscribe: subscription.unsubscribe,
    };
  }

  onceDoneLoading(callback) {
    this.doneLoadingCallbacks.push(callback);
    this._checkDoneLoading();
  }

  _checkDoneLoading() {
    if (this.doneLoadingCallbacks.length) {
      let anyLoading = false;
      Object.keys(this.queryKeyToState).forEach(queryKey => {
        const queryState = this.queryKeyToState[queryKey];
        if (queryState.loading && !queryState.errors.length) {
          anyLoading = true;
        }
      });
      if (!anyLoading) {
        this.doneLoadingCallbacks.forEach(cb => cb());
        this.doneLoadingCallbacks = [];
      }
    }
  }
}
