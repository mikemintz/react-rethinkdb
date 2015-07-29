'use strict';

var Promise = require('bluebird');
var r = require('rethinkdb');

var dbName = 'react_example_todomvc';

var connPromise = Promise.promisify(r.connect)({
	host: 'localhost',
	port: 28015,
	db: dbName,
});

function run(q) {
	return connPromise.then(function(c) {
		return q.run(c);
	});
}

function recreateDb(name) {
	return run(r.dbDrop(name))
		.catch(function(){})
		.then(function() { return run(r.dbCreate(name)); });
}

function recreateTable(name) {
	return run(r.tableDrop(name))
		.catch(function(){})
		.then(function() { return run(r.tableCreate(name)); });
}

console.log('Resetting todomvc db...');

recreateDb(dbName).then(function() {
	return recreateTable('todos').then(function() {
		return run(r.table('todos').indexCreate('createdAt'))
	});
}).then(function() {
	connPromise.then(function(c) { c.close(); });
	console.log('Completed');
});
