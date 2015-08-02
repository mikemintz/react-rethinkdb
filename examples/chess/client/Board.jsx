import React from 'react';
import {r, DefaultSession as RethinkSession} from 'react-rethinkdb';
import _ from 'lodash';
import {Square} from './Square.jsx';

// Return true if the provided squares are both defined and have the same rank
// and file.
const squareEq = (s1, s2) => (
  !!s1 && !!s2 && s1.rank === s2.rank && s1.file === s2.file
);

export const Board = React.createClass({
  getInitialState() {
    return {
      srcSquare: null,
    };
  },

  sideIsCurUser(side) {
    return this.props.authToken === this.props.game[side + 'AuthToken'];
  },

  pieceBelongsToPlayer(piece) {
    const side = piece.side.name;
    return this.sideIsCurUser(side);
  },

  squareIsSelected(square) {
    return squareEq(square, this.state.srcSquare);
  },

  validMoves() {
    return this.props.chessClient.getStatus().validMoves;
  },

  squareIsValidSrc(square) {
    return _.some(this.validMoves(), move => (
      squareEq(move.src, square) && this.pieceBelongsToPlayer(move.src.piece)
    ));
  },

  squareIsValidDst(square) {
    const move = _.find(this.validMoves(), m => squareEq(m.src, this.state.srcSquare));
    return !!move && _.some(move.squares, allowedDst => (
      squareEq(move.src, this.state.srcSquare) && squareEq(allowedDst, square)
    ));
  },

  handleClickSquare(index) {
    const square = this.props.chessClient.getStatus().board.squares[index];
    if (this.squareIsSelected(square)) {
      this.setState({srcSquare: null});
    } else if (this.squareIsValidSrc(square)) {
      this.setState({srcSquare: square});
    } else if (this.state.srcSquare) {
      if (this.squareIsValidDst(square)) {
        const query = r.table('moves').insert({
          timeStep: this.props.chessClient.game.moveHistory.length,
          src: this.state.srcSquare.file + this.state.srcSquare.rank,
          dst: square.file + square.rank,
          gameId: this.props.game.id,
          createdAt: r.now(),
        });
        RethinkSession.runQuery(query);
        this.setState({srcSquare: null});
      }
    }
  },

  render() {
    const whiteOnBottom = this.sideIsCurUser('white') || !this.sideIsCurUser('black');
    const {squares} = this.props.chessClient.getStatus().board;
    const squareWidth = 60;
    const numSquares = 8;
    const rdy = !this.props.loading;
    return (
      <div>
        <svg
          height={numSquares * squareWidth}
          width={numSquares * squareWidth}
          stroke="#000"
        >
          {squares.map((square, index) => (
            <Square
              key={index}
              index={index}
              rank={square.rank}
              file={square.file}
              pieceType={rdy && square.piece && square.piece.type}
              pieceColor={rdy && square.piece && square.piece.side.name}
              width={squareWidth}
              whiteOnBottom={whiteOnBottom}
              isValidSrc={rdy && this.squareIsValidSrc(square)}
              isValidDst={rdy && this.squareIsValidDst(square)}
              isSelected={rdy && this.squareIsSelected(square)}
              onClick={this.handleClickSquare}
            />
          ))}
        </svg>
      </div>
    );
  },
});
