/*eslint-env mocha */

import assert from 'assert';
import {rethinkdb as r, protodef} from 'rethinkdb-websocket-client';
import {
  findIndex,
  ensure,
  normalizeQueryEncoding,
} from '../src/util';

describe('util', () => {

  describe('findIndex', () => {
    it('returns -1 when there is no matching element', () => {
      assert.strictEqual(findIndex([], () => false), -1);
      assert.strictEqual(findIndex([1, 2, 3], () => false), -1);
      assert.strictEqual(findIndex([1, 2, 3], x => x === 4), -1);
    });
    it('returns the index when there is no matching element', () => {
      assert.strictEqual(findIndex([1, 2, 3], x => x === 1), 0);
      assert.strictEqual(findIndex([1, 2, 3], x => x === 2), 1);
    });
  });

  describe('ensure', () => {
    const truthyValues = [true, 1, 'a', [], {}];
    const falsyValues = [false, 0, '', undefined, null];
    it('does nothing for truthy values', () => {
      truthyValues.forEach(x => ensure(x, 'blah'));
    });
    it('throws errors for falsy values', () => {
      falsyValues.forEach(x => {
        assert.throws(() => ensure(x, 'blah'), /blah/);
      });
    });
  });

  describe('updateComponent', () => {
    it.skip('works');
  });

  describe('isCursor', () => {
    it.skip('works');
  });

  describe('normalizeQueryEncoding', () => {
    const genQuery = () => (
      r.table('turtles').filter(t => t('color').eq('green'))
    );
    const q1 = genQuery();
    const q2 = genQuery();
    it('is necessary', () => {
      assert.notStrictEqual(JSON.stringify(q1.build()), JSON.stringify(q2.build()));
    });
    it('results in identical encodings of identical queries', () => {
      const nq1 = normalizeQueryEncoding(q1);
      const nq2 = normalizeQueryEncoding(q2);
      const tt = protodef.Term.TermType;
      const encoding = [tt.FILTER, [
        [tt.TABLE, ['turtles']],
        [tt.FUNC, [
          [tt.MAKE_ARRAY, [0]],
          [tt.EQ, [
            [tt.BRACKET, [[tt.VAR, [0]], 'color']],
            'green'
          ]]
        ]]
      ]];
      assert.strictEqual(JSON.stringify(nq1.build()), JSON.stringify(nq2.build()));
      assert.strictEqual(JSON.stringify(nq1.build()), JSON.stringify(encoding));
    });
  });

});
