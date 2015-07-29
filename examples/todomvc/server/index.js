'use strict';

var express = require('express');
var http = require('http');
var wsListen = require('rethinkdb-websocket-server').listen;

// Set up the HTTP routes
var app = express();
app.use('/', express.static('assets'));
app.use('/node_modules', express.static('node_modules'));
var httpServer = http.createServer(app);

// Configure rethinkdb-websocket-server to listen on the /db path
wsListen({
	httpServer: httpServer,
	httpPath: '/db',
	dbHost: 'localhost',
	dbPort: 28015,
	unsafelyAllowAnyQuery: true,
});

// Start the HTTP server on the configured port
httpServer.listen(8015);
console.log('TodoMVC server started');
