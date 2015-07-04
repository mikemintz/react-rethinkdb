'use strict';

import express from 'express';
import http from 'http';
import {listen as wsListen} from 'rethinkdb-websocket-server';
import React from 'react';
import {Session as RethinkSession} from 'react-rethinkdb/dist/node';
import {Home} from '../client/Home.jsx';

// Set up the HTTP routes

const app = express();

app.use('/bundle.js', express.static('bundle.js'));

const htmlPrefix = '<html><body><div id="app">';
const htmlSuffix = '</div><script src="bundle.js"></script></body></html>';

app.get('/', (req, res) => {
  const rethinkSession = new RethinkSession();
  rethinkSession.connect({host: 'localhost', port: 8015, path: '/db', secure: false});
  const elem = React.createElement(Home, {rethinkSession});
  React.renderToString(elem);
  let sent = false;
  const sendResponseOnce = () => {
    if (!sent) {
      const content = React.renderToString(elem);
      rethinkSession.close();
      const html = [htmlPrefix, content, htmlSuffix].join('');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
      sent = true;
    }
  };
  rethinkSession.onceDoneLoading(sendResponseOnce);
  setTimeout(sendResponseOnce, 200); // timeout after 200ms
});

const httpServer = http.createServer(app);

// Configure rethinkdb-websocket-server to listen on the /db path
wsListen({
  httpServer,
  httpPath: '/db',
  unsafelyAllowAnyQuery: true,
});

// Start the HTTP server on the configured port
httpServer.listen(8015);
console.log('App server started');
