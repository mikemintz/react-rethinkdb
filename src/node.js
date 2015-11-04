import {BaseMixin, PropsMixin} from './Mixin';
import {QueryRequest} from './QueryRequest';
import {MetaSession} from './Session';
import * as RethinkdbWebsocketClient from 'rethinkdb-websocket-client/dist/node';

const r = RethinkdbWebsocketClient.rethinkdb;
const Session = MetaSession(RethinkdbWebsocketClient);

const ReactRethinkdb = {
  BaseMixin,
  PropsMixin,
  QueryRequest,
  r,
  Session,
};

export {
  BaseMixin,
  PropsMixin,
  QueryRequest,
  r,
  Session,
  ReactRethinkdb as default,
};
