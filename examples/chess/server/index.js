'use strict';

import cfg from './config';
import express from 'express';
import http from 'http';
import {listen as wsListen} from 'rethinkdb-websocket-server';
import Promise from 'bluebird';
import {queryWhitelist} from './queries';

// Set up the HTTP routes

const app = express();
app.use('/', express.static('assets'));

const httpServer = http.createServer(app);

// Instantiate a session object with an authToken property for every incoming
// websocket connection
const sessionCreator = urlQueryParams => {
  return Promise.resolve({authToken: urlQueryParams.authToken});
};

// Configure rethinkdb-websocket-server to listen on the /db path
wsListen({
  httpServer,
  httpPath: '/db',
  dbPort: cfg.dbPort,
  dbHost: cfg.dbHost,
  sessionCreator,
  unsafelyAllowAnyQuery: false,
  queryWhitelist,
});

// Start the HTTP server on the configured port
httpServer.listen(cfg.webPort);
console.log('Chess server started');
