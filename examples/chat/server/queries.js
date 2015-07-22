'use strict';

import cfg from './config';
import {RQ} from 'rethinkdb-websocket-server';

// The queries in this array were logged by rethinkdb-websocket-server and
// copied manually into this file while developing the front-end.
//
// I then replaced dynamic parts of the queries like the recent timestamp with
// pattern functions like x => typeof x === 'string'
//
// I then replaced parts of the insert query with RQ.ref() references and added
// a validate() call, which ensures users cannot impersonate other users and
// that message bodies cannot be blank.
export const queryWhitelist = [

  // List recent messages
  RQ(
    RQ.FILTER(
      RQ.ORDER_BY(RQ.TABLE("messages")).opt("index", "createdAt"),
      RQ.FUNC(
        RQ.MAKE_ARRAY(0),
        RQ.GE(
          RQ.BRACKET(RQ.IMPLICIT_VAR(), "createdAt"),
          RQ.ISO8601(x => typeof x === 'string')
        )
      )
    )
  ).opt("db", RQ.DB(cfg.dbName)),

  // List recent messages with changefeed
  RQ(
    RQ.CHANGES(
      RQ.FILTER(
        RQ.ORDER_BY(RQ.TABLE("messages")).opt("index", "createdAt"),
        RQ.FUNC(
        RQ.MAKE_ARRAY(0),
          RQ.GE(
            RQ.BRACKET(RQ.IMPLICIT_VAR(), "createdAt"),
            RQ.ISO8601(x => typeof x === 'string')
          )
        )
      )
    ).opt("include_states", true)
  ).opt("db", RQ.DB(cfg.dbName)),

  // Insert new message
  RQ(
    RQ.INSERT(
      RQ.TABLE("messages"),
      {
        "body": RQ.ref("body"),
        "userId": RQ.ref("userId"),
        "createdAt": RQ.NOW()
      }
    )
  ).opt("db", RQ.DB(cfg.dbName))
  .validate((refs, session) => (
    refs.userId === session.userId
    && typeof refs.body === 'string'
    && refs.body.trim().length > 0
  )),

];
