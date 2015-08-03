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
    const genQuery1 = () => (
      r.table('turtles').filter(t => t('color').eq('green'))
    );
    const q1a = genQuery1();
    const q1b = genQuery1();
    const q2a = r.table('turtles').insert({color: 'green', isSeaTurtle: true});
    const q2b = r.table('turtles').insert({isSeaTurtle: true, color: 'green'});
    it('is necessary', () => {
      assert.notStrictEqual(JSON.stringify(q1a.build()), JSON.stringify(q1b.build()));
      assert.notStrictEqual(JSON.stringify(q2a.build()), JSON.stringify(q2b.build()));
    });
    it('results in identical encodings of identical queries', () => {
      const nq1a = normalizeQueryEncoding(q1a);
      const nq1b = normalizeQueryEncoding(q1b);
      const nq2a = normalizeQueryEncoding(q2a);
      const nq2b = normalizeQueryEncoding(q2b);
      const tt = protodef.Term.TermType;
      const encoding1 = [tt.FILTER, [
        [tt.TABLE, ['turtles']],
        [tt.FUNC, [
          [tt.MAKE_ARRAY, [0]],
          [tt.EQ, [
            [tt.BRACKET, [[tt.VAR, [0]], 'color']],
            'green'
          ]]
        ]]
      ]];
      const encoding2 = [tt.INSERT, [
        [tt.TABLE, ['turtles']],
        {color: 'green', isSeaTurtle: true}
      ]];
      assert.strictEqual(JSON.stringify(nq1a.build()), JSON.stringify(nq1b.build()));
      assert.strictEqual(JSON.stringify(nq1a.build()), JSON.stringify(encoding1));
      assert.strictEqual(JSON.stringify(nq2a.build()), JSON.stringify(nq2b.build()));
      assert.strictEqual(JSON.stringify(nq2a.build()), JSON.stringify(encoding2));
    });
  });

});
