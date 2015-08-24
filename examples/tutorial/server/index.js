// Import third-party libraries (managed by npm)
var express = require('express');
var http = require('http');
var RethinkdbWebsocketServer = require('rethinkdb-websocket-server');

// Set up an HTTP route to serve files from assets/
var app = express();
app.use('/', express.static('assets'));
var httpServer = http.createServer(app);

// Configure rethinkdb-websocket-server to listen on the /db path and proxy
// incoming WebSocket connections to the RethinkDB server running on localhost
// port 28015. Because unsafelyAllowAnyQuery is true, any incoming query will
// be accepted (not safe in production).
RethinkdbWebsocketServer.listen({
	httpServer: httpServer,
	httpPath: '/db',
	dbHost: 'localhost',
	dbPort: 28015,
	unsafelyAllowAnyQuery: true,
});

// Start the HTTP server on port 8015
httpServer.listen(8015);
console.log('Tutorial server started');
