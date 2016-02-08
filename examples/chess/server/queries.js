import cfg from './config';
import Promise from 'bluebird';
import {r, RP} from 'rethinkdb-websocket-server';
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
// pattern functions like RP.check(x => typeof x === 'string')
//
// I then replaced parts of the insert move query with RP.ref() references and
// added a validate() call, which ensures users cannot impersonate other users
// and that moves are valid chess moves.
export const queryWhitelist = [

  // List games with changefeed
  r.table("games").merge({
    blackAuthToken: r.branch(
      r.row("blackAuthToken").eq(RP.check(x => typeof x === 'string')),
      RP.check(x => typeof x === 'string'),
      r.row("blackAuthToken").ne(null)
    ),
    whiteAuthToken: r.branch(
      r.row("whiteAuthToken").eq(RP.check(x => typeof x === 'string')),
      RP.check(x => typeof x === 'string'),
      r.row("whiteAuthToken").ne(null)
    ),
  })
  .changes({includeStates: true, includeInitial: true})
  .opt("db", r.db(cfg.dbName)),

  // List moves for a game with changefeed
  r.table("moves")
   .filter({"gameId": RP.check(x => typeof x === 'string')})
   .changes({includeStates: true, includeInitial: true})
   .opt("db", r.db(cfg.dbName)),

  // Create new game
  r.table("games").insert({
    createdAt: r.now(),
    whiteAuthToken: null,
    blackAuthToken: null,
  }).opt("db", r.db(cfg.dbName)),

  // Sit down as white
  r.table("games")
   .filter({id: RP.check(x => typeof x === 'string'), whiteAuthToken: null})
   .update({whiteAuthToken: RP.check(x => typeof x === 'string')})
   .opt("db", r.db(cfg.dbName)),

  // Sit down as black
  r.table("games")
   .filter({id: RP.check(x => typeof x === 'string'), blackAuthToken: null})
   .update({blackAuthToken: RP.check(x => typeof x === 'string')})
   .opt("db", r.db(cfg.dbName)),

  // Create a new move
  r.table("moves").insert({
    timeStep: RP.ref('timeStep'),
    src: RP.ref('src'),
    dst: RP.ref('dst'),
    gameId: RP.ref('gameId'),
    createdAt: r.now(),
  }).opt("db", r.db(cfg.dbName))
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
