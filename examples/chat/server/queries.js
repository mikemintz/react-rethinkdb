import cfg from './config';
import {r, RP} from 'rethinkdb-websocket-server';

// The queries in this array were logged by rethinkdb-websocket-server and
// copied manually into this file while developing the front-end.
//
// I then replaced dynamic parts of the queries like the recent timestamp with
// pattern functions like RP.check(x => typeof x === 'string')
//
// I then replaced parts of the insert query with RP.ref() references and added
// a validate() call, which ensures users cannot impersonate other users and
// that message bodies cannot be blank.
export const queryWhitelist = [

  // List recent messages with changefeed
  r.table("messages")
   .orderBy({index: "createdAt"})
   .filter(r.row("createdAt").ge(r.ISO8601(RP.check(x => typeof x === 'string'))))
   .changes({includeStates: true, includeInitial: true})
   .opt("db", r.db(cfg.dbName)),

  // Insert new message
  r.table("messages")
   .insert({body: RP.ref("body"), userId: RP.ref("userId"), createdAt: r.now()})
   .opt("db", r.db(cfg.dbName))
   .validate((refs, session) => (
    refs.userId === session.userId
    && typeof refs.body === 'string'
    && refs.body.trim().length > 0
  )),

];
