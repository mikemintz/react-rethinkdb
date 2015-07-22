'use strict';

import React from 'react';
import {r, QueryRequest, DefaultMixin as RethinkMixin} from 'react-rethinkdb';
import _ from 'lodash';
import {Game} from './Game.jsx';
import {GameList} from './GameList.jsx';

export const Home = React.createClass({
  mixins: [RethinkMixin],

  observe(props, state) {
    // Query for all games, but replace the whiteAuthToken and blackAuthToken
    // fields with masked versions: unchanged if equal to props.authToken,
    // false if null, or true otherwise. That way, whiteAuthToken will be
    // truthy if someone is playing white, and it will be equal to
    // props.authToken if that someone is the current user.
    const maskAuthTokenExpr = side => {
      const token = props.authToken;
      const field = r.row(side + 'AuthToken');
      return r.branch(field.eq(token), token, field.ne(null));
    };
    return {
      games: new QueryRequest({
        query: r.table('games').merge({
          whiteAuthToken: maskAuthTokenExpr('white'),
          blackAuthToken: maskAuthTokenExpr('black'),
        }),
        changes: true,
        initial: [],
      }),
    };
  },

  render() {
    const games = this.data.games.value();
    const orderedGames = _.sortBy(games, x => -x.createdAt.getTime());
    const selectedGame = _.find(games, {id: this.props.params.gameId});
    return (
      <div className="home">
        <GameList games={orderedGames} gameId={this.props.params.gameId} />
        {selectedGame && (
          <Game game={selectedGame} authToken={this.props.authToken} />
        )}
      </div>
    );
  },
});
