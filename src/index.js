import {BaseMixin} from './Mixin';
import {MetaSession} from './Session';
import * as RethinkdbWebsocketClient from 'rethinkdb-websocket-client';

export {BaseMixin, PropsMixin} from './Mixin';
export {QueryRequest} from './QueryRequest';

export const r = RethinkdbWebsocketClient.rethinkdb;
export const Session = MetaSession(RethinkdbWebsocketClient);

// Singleton session for convenience.
export const DefaultSession = new Session();

// Singleton mixin for convenience, which uses the DefaultSession singleton as
// the session.
export const DefaultMixin = BaseMixin(() => DefaultSession);
