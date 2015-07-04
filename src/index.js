'use strict';

import {BaseMixin} from './Mixin';
import {Session} from './Session';

export {rethinkdb as r} from 'rethinkdb-websocket-client';
export {BaseMixin, PropsMixin} from './Mixin';
export {QueryRequest} from './QueryRequest';
export {Session} from './Session';

// Singleton session for convenience.
export const DefaultSession = new Session();

// Singleton mixin for convenience, which uses the DefaultSession singleton as
// the session.
export const DefaultMixin = BaseMixin(() => DefaultSession);
