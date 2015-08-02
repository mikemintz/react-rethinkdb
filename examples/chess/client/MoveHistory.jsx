import React from 'react';

export const MoveHistory = React.createClass({
  render() {
    return (
      <div className="moveHistory">
        <div className="title">
          Move history
        </div>
        {this.props.chessClient.game.moveHistory.map((move, index) => (
          <div key={index}>
            {index + 1}
            {'. '}
            {move.prevFile}
            {move.prevRank}
            {move.postFile}
            {move.postRank}
          </div>
        ))}
      </div>
    );
  },
});
