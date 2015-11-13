import Promise from 'bluebird';
import {r} from 'rethinkdb-websocket-server';
import cfg from './config';

const connPromise = Promise.promisify(r.connect)({
  host: cfg.dbHost,
  port: cfg.dbPort,
  db: cfg.dbName,
});
const run = q => connPromise.then(c => q.run(c));

console.log('Resetting chat db...');

const recreateDb = name => run(r.dbDrop(name))
                           .catch(() => {})
                           .then(() => run(r.dbCreate(name)));

const recreateTable = name => run(r.tableDrop(name))
                              .catch(() => {})
                              .then(() => run(r.tableCreate(name)));

recreateDb(cfg.dbName).then(() => (
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
