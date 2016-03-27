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
  if (component._rethinkMixinState.isMounted && typeof document !== 'undefined') {
    component.forceUpdate();
  }
};

// TODO is there a better way to distinguish cursors from single record
// responses?
export const isCursor = x => (
  x && typeof x === 'object' && typeof x.toArray === 'function'
);

// Return a copy of the RethinkDB query, in which the JSON encoding is
// normalized, so identical queries will always generate the same string for
// JSON.stringify(query.build()).
//
// This allows QueryRequest.toStringKey() to return the same value for
// identical queries, facilitating the sharing of results among components that
// subscribe to the same query.
//
// This also simplifies the query whitelist in the backend, since there are
// fewer variations of the same types of queries.
//
// This function performs two types of normalization:
// 1. Ensure objects are created with the same insertion order
// 2. Ensure var ids are consistent when re-generating the same query
//
// Object insertion order normalization will make these two queries identical:
//   r.table('turtles').insert({color: 'green', isSeaTurtle: true});
//   r.table('turtles').insert({isSeaTurtle: true, color: 'green'});
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
export const normalizeQueryEncoding = query => {
  // Since we can't clone query objects, we'll make a new query and override
  // the build() method that the driver uses to serialize to the JSON protocol.
  // By using the expression [query], the toString() method will be readable,
  // which helps for error reporting in the browser console. We can't use
  // rethinkdb(query) verbatim since that just returns query itself, which we
  // don't want to mess with.
  const normalizedQuery = rethinkdb([query]);
  normalizedQuery.build = () => {
    let nextNormalizedVarId = 0;
    const varIdToNormalizedMap = {};
    const normalizeVarId = id => {
      if (!(id in varIdToNormalizedMap)) {
        varIdToNormalizedMap[id] = nextNormalizedVarId++;
      }
      return varIdToNormalizedMap[id];
    };
    const traverse = term => {
      if (Array.isArray(term)) {
        const [termId, args, options] = term;
        if (termId === protodef.Term.TermType.FUNC) {
          // The term looks like [FUNC, [[MAKE_ARRAY, [1, 2]], ...]]
          args[0][1] = args[0][1].map(normalizeVarId);
        } else if (termId === protodef.Term.TermType.VAR) {
          // The term looks like [VAR, [1]]
          args[0] = normalizeVarId(args[0]);
        }
        const normalizedTerm = [termId, args.map(traverse)];
        if (options) {
          normalizedTerm.push(traverse(options));
        }
        return normalizedTerm;
      } else if (term && typeof term === 'object') {
        const normalizedObject = {};
        const keys = Object.keys(term);
        keys.sort();
        keys.forEach(key => {
          normalizedObject[key] = traverse(term[key]);
        });
        return normalizedObject;
      } else {
        return term;
      }
    };
    return traverse(query.build());
  };
  return normalizedQuery;
};
