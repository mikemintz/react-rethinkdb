'use strict';

import {MetaSession} from './Session';
import * as RethinkdbWebsocketClient from 'rethinkdb-websocket-client/dist/node';

export {BaseMixin, PropsMixin} from './Mixin';
export {QueryRequest} from './QueryRequest';

export const r = RethinkdbWebsocketClient.rethinkdb;
export const Session = MetaSession(RethinkdbWebsocketClient);
