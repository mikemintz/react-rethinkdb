import React from 'react';
import chess from 'chess';
import {r, QueryRequest, DefaultMixin as RethinkMixin} from 'react-rethinkdb';
import _ from 'lodash';
import {Board} from './Board.jsx';
import {GameStatus} from './GameStatus.jsx';
import {MoveHistory} from './MoveHistory.jsx';

export const Game = React.createClass({
  mixins: [RethinkMixin],

  observe(props, state) {
    return {
      moves: new QueryRequest({
        query: r.table('moves').filter({gameId: props.game.id}),
        changes: true,
        initial: [],
      }),
    };
  },

  render() {
    const chessClient = chess.createSimple();
    const moves = this.data.moves.value();
    const orderedMoves = _.sortBy(moves, move => move.timeStep);
    // TODO Support pawn promotion. Fix in backend validation too.
    orderedMoves.forEach(move => {
      chessClient.move(move.src, move.dst);
    });
    return (
      <div className="game">
        <Board
          loading={this.data.moves.loading()}
          game={this.props.game}
          chessClient={chessClient}
          authToken={this.props.authToken}
        />
        <div>
          <GameStatus
            game={this.props.game}
            chessClient={chessClient}
            authToken={this.props.authToken}
          />
          <MoveHistory chessClient={chessClient} />
        </div>
      </div>
    );
  },
});
