/*eslint-env mocha */

import assert from 'assert';
import {
  findIndex,
  ensure,
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
    const truthyValues = [1, 'a', [], {}];
    const falsyValues = [0, '', undefined, null];
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

  describe('normalizeQueryVars', () => {
    it.skip('works');
  });

});
