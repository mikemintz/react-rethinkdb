import React from 'react';
import {r, DefaultSession as RethinkSession} from 'react-rethinkdb';

export const GameStatus = React.createClass({
  sideIsNextMove(side) {
    return this.props.chessClient.game.getCurrentSide().name === side;
  },

  sideIsOccupied(side) {
    return !!this.props.game[side + 'AuthToken'];
  },

  sideIsCurUser(side) {
    return this.props.authToken === this.props.game[side + 'AuthToken'];
  },

  handleSitOnSide(side) {
    // Update the whiteAuthToken or blackAuthToken field of the current game to
    // have the current user's authToken. Filter that the field must originally
    // be null to ensure a malicious user can't sit in an occupied seat.
    const authTokenKey = side + 'AuthToken';
    const newFields = {};
    newFields[authTokenKey] = this.props.authToken;
    const filterFields = {id: this.props.game.id};
    filterFields[authTokenKey] = null;
    const query = r.table('games').filter(filterFields).update(newFields);
    RethinkSession.runQuery(query);
  },

  renderLabel(side) {
    if (this.sideIsCurUser(side)) {
      return 'You';
    } else if (this.sideIsOccupied(side)) {
      return 'Occupied';
    } else {
      return (
        <span>
          Empty
          {' '}
          <button onClick={this.handleSitOnSide.bind(this, side)}>
            Sit
          </button>
        </span>
      );
    }
  },

  render() {
    return (
      <div className="gameStatus">
        {['white', 'black'].map(side => (
          <div key={side}>
            <img
              src={`images/king-${side}.svg`}
              className={this.sideIsNextMove(side) && 'nextMove'}
            />
            {this.renderLabel(side)}
          </div>
        ))}
      </div>
    );
  },
});
