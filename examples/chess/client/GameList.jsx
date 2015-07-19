'use strict';

import React from 'react';
import moment from 'moment';
import {r, DefaultSession as RethinkSession} from 'react-rethinkdb';
import ReactRouter from 'react-router';

export const GameList = React.createClass({
  mixins: [ReactRouter.Navigation],

  handleNewGame(event) {
    const query = r.table('games').insert({
      createdAt: r.now(),
      whiteAuthToken: null,
      blackAuthToken: null,
    });
    RethinkSession.runQuery(query).then(response => {
      this.transitionTo('game', {gameId: response.generated_keys[0]});
    });
  },

  renderGameItem(game, index) {
    const started = game.blackAuthToken && game.whiteAuthToken;
    const empty = !game.blackAuthToken && !game.whiteAuthToken;
    const status = started ? 'started' : empty ? 'empty' : 'waiting';
    const name = `Game ${this.props.games.length - index} (${status})`;
    const href = this.makeHref('game', {gameId: game.id});
    const isActive = game.id === this.props.gameId;
    const timestamp = moment(game.createdAt).fromNow();
    return (
      <div key={game.id} className="gameItem">
        {isActive ? <b>{name}</b> : <a href={href}>{name}</a>}
        <div className="timestamp">{timestamp}</div>
      </div>
    );
  },

  render() {
    const gameItems = this.props.games.map((game, index) => (
      this.renderGameItem(game, index)
    ));
    return (
      <div className="gameList">
        <button onClick={this.handleNewGame}>
          New game
        </button>
        <div>
          {gameItems}
        </div>
      </div>
    );
  },
});
