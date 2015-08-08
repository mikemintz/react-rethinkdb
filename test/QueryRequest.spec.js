/*eslint-env mocha */

import assert from 'assert';
import {rethinkdb as r} from 'rethinkdb-websocket-client';
import {QueryRequest} from '../src/node';

describe('QueryRequest', () => {
  describe('toStringKey', () => {

    it('cares about "query" equality', () => {
      assert.strictEqual(
        new QueryRequest({
          query: r.table('turtles').filter(t => t('color').eq('green')),
          changes: false,
          initial: [],
        }).toStringKey(),
        new QueryRequest({
          query: r.table('turtles').filter(t => t('color').eq('green')),
          changes: false,
          initial: [],
        }).toStringKey()
      );
      assert.notStrictEqual(
        new QueryRequest({
          query: r.table('turtles').filter(t => t('color').eq('green')),
          changes: false,
          initial: [],
        }).toStringKey(),
        new QueryRequest({
          query: r.table('turtles').filter(t => t('color').eq('red')),
          changes: false,
          initial: [],
        }).toStringKey()
      );
    });

    it('cares about "changes" equality', () => {
      assert.strictEqual(
        new QueryRequest({
          query: r.table('turtles'),
          changes: true,
          initial: [],
        }).toStringKey(),
        new QueryRequest({
          query: r.table('turtles'),
          changes: true,
          initial: [],
        }).toStringKey()
      );
      assert.notStrictEqual(
        new QueryRequest({
          query: r.table('turtles'),
          changes: true,
          initial: [],
        }).toStringKey(),
        new QueryRequest({
          query: r.table('turtles'),
          changes: false,
          initial: [],
        }).toStringKey()
      );
    });

    it('does not care about "initial" equality', () => {
      assert.strictEqual(
        new QueryRequest({
          query: r.table('turtles'),
          changes: false,
          initial: [],
        }).toStringKey(),
        new QueryRequest({
          query: r.table('turtles'),
          changes: false,
          initial: null,
        }).toStringKey()
      );
    });

  });
});
