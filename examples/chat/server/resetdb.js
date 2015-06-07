'use strict';

import Promise from 'bluebird';
import r from 'rethinkdb';

//TODO eslint this file automatically

const connPromise = Promise.promisify(r.connect)({
  host: 'localhost',
  port: 28015,
  db: 'react_example_chat',
});
const run = q => connPromise.then(c => q.run(c));

console.log('Resetting chat db...');

const recreateDb = name => run(r.dbDrop(name))
                           .catch(() => {})
                           .then(() => run(r.dbCreate(name)));

const recreateTable = name => run(r.tableDrop(name))
                              .catch(() => {})
                              .then(() => run(r.tableCreate(name)));

recreateDb('react_example_chat').then(() => (
  Promise.all([
    recreateTable('messages').then(() => (
      run(r.table('messages').indexCreate('createdAt'))
    )),
    recreateTable('users'),
  ])
)).then(() => {
  connPromise.then(c => c.close());
  console.log('Completed');
});
