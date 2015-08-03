import {rethinkdb, protodef} from 'rethinkdb-websocket-client';

export const findIndex = (arr, fn) => {
  for (let i = 0; i < arr.length; ++i) {
    if (fn(arr[i])) {
      return i;
    }
  }
  return -1;
};

export const ensure = (value, msg) => {
  if (!value) {
    throw new Error(msg);
  }
};

export const updateComponent = component => {
  // Check for document because of this bug:
  // https://github.com/facebook/react/issues/3620
  if (component.isMounted() && typeof document !== 'undefined') {
    component.forceUpdate();
  }
};

// TODO is there a better way to distinguish cursors from single record
// responses?
export const isCursor = x => (
  x && typeof x === 'object' && typeof x.toArray === 'function'
);

// Return a normalized version of the RethinkDB query, in which var ids are
// guaranteed to be consistent when re-generating the same query.
//
// Var ids are used in reql anonymous functions. For example, the query below
// is represents as follows in the RethinkDB JSON protocol:
//
// Query:
//   r.table('turtles').filter(t => t('color').eq('green'))
//
// JSON protocol:
//   [FILTER, [
//     [TABLE, ["turtles"]],
//     [FUNC, [
//       [MAKE_ARRAY, [123]],
//       [EQ, [
//         [BRACKET, [[VAR, [123]], "color"]],
//         "green"
//       ]]
//     ]]
//   ]]
//
// Normally, every time that query is generated, the var id representing the t
// argument (seen as 123 above) will increment due to a global counter in the
// RethinkDB driver. So even though the query is supposed to be the same every
// time it is generated, the RethinkDB protocol represents it differently. By
// wrapping the query with this function, the RethinkDB protocol will look the
// same regardless of what the var ids are.
//
// This allows QueryRequest.toStringKey() to return the same value for
// identical queries, facilitating the sharing of results among components that
// subscribe to the same query.
//
// This also simplifies the query whitelist in the backend, since there are
// fewer variations of the same types of queries.
export const normalizeQueryEncoding = query => {
  // Since we can't clone query objects, we'll make a new query and override
  // the build() method that the driver uses to serialize to the JSON protocol.
  // By using the expression [query], the toString() method will be readable,
  // which helps for error reporting in the browser console. We can't use
  // rethinkdb(query) verbatim since that just returns query itself, which we
  // don't want to mess with.
  const normalizedQuery = rethinkdb([query]);
  normalizedQuery.build = () => {
    let nextNormalizedId = 0;
    const idToNormalizedMap = {};
    const normalize = id => {
      if (!(id in idToNormalizedMap)) {
        idToNormalizedMap[id] = nextNormalizedId++;
      }
      return idToNormalizedMap[id];
    };
    const traverse = term => {
      if (Array.isArray(term)) {
        const [termId, args, options] = term;
        if (termId === protodef.Term.TermType.FUNC) {
          // The term looks like [FUNC, [[MAKE_ARRAY, [1, 2]], ...]]
          args[0][1] = args[0][1].map(normalize);
        } else if (termId === protodef.Term.TermType.VAR) {
          // The term looks like [VAR, [1]]
          args[0] = normalize(args[0]);
        }
        args.forEach(traverse);
        traverse(options);
      } else if (term && typeof term === 'object') {
        Object.keys(term).forEach(key => traverse(term[key]));
      }
    };
    const result = query.build();
    traverse(result);
    return result;
  };
  return normalizedQuery;
};
