'use strict';

import cfg from './config';
import r from 'rethinkdb';
import Promise from 'bluebird';
import {RQ} from 'rethinkdb-websocket-server';
import chess from 'chess';
import _ from 'lodash';

// Connect to rethinkdb so we can perform validation queries
const dbOpts = {host: cfg.dbHost, port: cfg.dbPort, db: cfg.dbName};
const dbConnPromise = Promise.promisify(r.connect)(dbOpts);
const run = query => dbConnPromise.then(c => query.run(c));


// The queries in this array were logged by rethinkdb-websocket-server and
// copied manually into this file while developing the front-end.
//
// I then replaced dynamic parts of the queries like the game id with
// pattern functions like x => typeof x === 'string'
//
// I then replaced parts of the insert move query with RQ.ref() references and
// added a validate() call, which ensures users cannot impersonate other users
// and that moves are valid chess moves.
export const queryWhitelist = [

  // List games
  RQ(
    RQ.MERGE(
      RQ.TABLE("games"),
      RQ.FUNC(
        RQ.MAKE_ARRAY(x => typeof x === 'number'),
        {
          "whiteAuthToken": RQ.BRANCH(
            RQ.EQ(
              RQ.BRACKET(RQ.IMPLICIT_VAR(), "whiteAuthToken"),
              x => typeof x === 'string'
            ),
            x => typeof x === 'string',
            RQ.NE(
              RQ.BRACKET(RQ.IMPLICIT_VAR(), "whiteAuthToken"),
              null
            )
          ),
          "blackAuthToken": RQ.BRANCH(
            RQ.EQ(
              RQ.BRACKET(RQ.IMPLICIT_VAR(), "blackAuthToken"),
              x => typeof x === 'string'
            ),
            x => typeof x === 'string',
            RQ.NE(
              RQ.BRACKET(RQ.IMPLICIT_VAR(), "blackAuthToken"),
              null
            )
          )
        }
      )
    )
  ).opt("db", RQ.DB(cfg.dbName)),

  // List games with changefeed
  RQ(
    RQ.CHANGES(
      RQ.MERGE(
        RQ.TABLE("games"),
        RQ.FUNC(
        RQ.MAKE_ARRAY(x => typeof x === 'number'),
          {
            "whiteAuthToken": RQ.BRANCH(
              RQ.EQ(
                RQ.BRACKET(RQ.IMPLICIT_VAR(), "whiteAuthToken"),
                x => typeof x === 'string'
              ),
              x => typeof x === 'string',
              RQ.NE(
                RQ.BRACKET(RQ.IMPLICIT_VAR(), "whiteAuthToken"),
                null
              )
            ),
            "blackAuthToken": RQ.BRANCH(
              RQ.EQ(
                RQ.BRACKET(RQ.IMPLICIT_VAR(), "blackAuthToken"),
                x => typeof x === 'string'
              ),
              x => typeof x === 'string',
              RQ.NE(
                RQ.BRACKET(RQ.IMPLICIT_VAR(), "blackAuthToken"),
                null
              )
            )
          }
        )
      )
    ).opt("include_states", true)
  ).opt("db", RQ.DB(cfg.dbName)),

  // List moves for a game
  RQ(
    RQ.FILTER(
      RQ.TABLE("moves"),
      {"gameId": x => typeof x === 'string'}
    )
  ).opt("db", RQ.DB(cfg.dbName)),

  // List moves for a game with changefeed
  RQ(
    RQ.CHANGES(
      RQ.FILTER(
        RQ.TABLE("moves"),
        {"gameId": x => typeof x === 'string'}
      )
    ).opt("include_states", true)
  ).opt("db", RQ.DB(cfg.dbName)),

  // Create new game
  RQ(
    RQ.INSERT(
      RQ.TABLE("games"),
      {
        "createdAt": RQ.NOW(),
        "whiteAuthToken": null,
        "blackAuthToken": null
      }
    )
  ).opt("db", RQ.DB(cfg.dbName)),

  // Sit down as white
  RQ(
    RQ.UPDATE(
      RQ.FILTER(
        RQ.TABLE("games"),
        {
          "id": x => typeof x === 'string',
          "whiteAuthToken": null
        }
      ),
      {"whiteAuthToken": x => typeof x === 'string'}
    )
  ).opt("db", RQ.DB(cfg.dbName)),

  // Sit down as black
  RQ(
    RQ.UPDATE(
      RQ.FILTER(
        RQ.TABLE("games"),
        {
          "id": x => typeof x === 'string',
          "blackAuthToken": null
        }
      ),
      {"blackAuthToken": x => typeof x === 'string'}
    )
  ).opt("db", RQ.DB(cfg.dbName)),

  // Create a new move
  RQ(
    RQ.INSERT(
      RQ.TABLE("moves"),
      {
        "timeStep": RQ.ref('timeStep'),
        "src": RQ.ref('src'),
        "dst": RQ.ref('dst'),
        "gameId": RQ.ref('gameId'),
        "createdAt": RQ.NOW()
      }
    )
  ).opt("db", RQ.DB(cfg.dbName))
  .validate((refs, session) => {
    return run(r.table('games').get(refs.gameId)).then(game => {
      return run(r.table('moves').filter({gameId: refs.gameId})).then(moveCursor => {
        return moveCursor.toArray().then(moves => {
          const chessClient = chess.createSimple();
          const orderedMoves = _.sortBy(moves, move => move.timeStep);
          orderedMoves.forEach(move => {
            chessClient.move(move.src, move.dst);
          });
          const timeStepIsValid = refs.timeStep === moves.length;
          const sideWithNextMove = chessClient.game.getCurrentSide().name;
          const expectedAuthToken = game[sideWithNextMove + 'AuthToken'];
          const authTokenIsValid = expectedAuthToken === session.authToken;

          let moveIsValid = true;
          try {
            chessClient.move(refs.src, refs.dst);
          } catch (e) {
            moveIsValid = false;
          }
          return timeStepIsValid && authTokenIsValid && moveIsValid;
        });
      });
    });
  }),

];
