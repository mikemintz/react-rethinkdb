'use strict';

import React from 'react';
import crypto from 'crypto';
import ReactRouter from 'react-router';
import {DefaultSession as RethinkSession} from 'react-rethinkdb';
import {Home} from './Home.jsx';

// Generate a random 16-byte auth token, or load it from localStorage if we
// already have one. This will be used to ensure that malicious users cannot
// impersonate other players.
let authToken = window.localStorage.getItem('authToken');
if (!authToken) {
  const numBytes = 16;
  authToken = crypto.randomBytes(numBytes).toString('base64');
  window.localStorage.setItem('authToken', authToken);
}

// Open connection to rethinkdb-websocket-server.
const secure = window.location.protocol === 'https:';
const path = '/db?authToken=' + encodeURIComponent(authToken);
RethinkSession.connect({
  host: window.location.hostname,
  port: window.location.port || (secure ? 443 : 80),
  path: path,
  secure: secure,
  db: 'react_example_chess',
});

// Render <Home authToken={authToken} /> in <div id="app" />
const routes = (
  <ReactRouter.Route>
    <ReactRouter.DefaultRoute handler={Home} />
    <ReactRouter.Route name="game" path="/:gameId" handler={Home} />
  </ReactRouter.Route>
);
const mountNode = document.getElementById('app');
ReactRouter.run(routes, ReactRouter.HashLocation, Root => {
  React.render(<Root authToken={authToken} />, mountNode);
});
