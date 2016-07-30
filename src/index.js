import {BaseHoC, PropsHoC} from './HoC';
import {BaseMixin, PropsMixin} from './Mixin';
import {QueryRequest} from './QueryRequest';
import {MetaSession} from './Session';
import * as RethinkdbWebsocketClient from 'rethinkdb-websocket-client';

const r = RethinkdbWebsocketClient.rethinkdb;
const Session = MetaSession(RethinkdbWebsocketClient);

// Singleton session for convenience.
const DefaultSession = new Session();

// Singleton mixin for convenience, which uses the DefaultSession singleton as
// the session.
const DefaultMixin = BaseMixin(() => DefaultSession);
const DefaultHoC = BaseHoC(() => DefaultSession);

const ReactRethinkdb = {
  BaseMixin,
  PropsMixin,
  BaseHoC,
  PropsHoC,
  QueryRequest,
  r,
  Session,
  DefaultSession,
  DefaultMixin,
  DefaultHoC
};

export {
  BaseMixin,
  PropsMixin,
  BaseHoC,
  PropsHoC,
  QueryRequest,
  r,
  Session,
  DefaultSession,
  DefaultMixin,
  DefaultHoC,
  ReactRethinkdb as default,
};
