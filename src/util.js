'use strict';

export const findIndex = (arr, fn) => {
  for (let i in arr) {
    if (fn(arr[i])) {
      return i;
    }
  }
  return -1;
};

export const ensure = (value, msg) => {
  if (!value) {
    throw new Error(msg);
  }
};

export const updateComponent = component => {
  if (component.isMounted()) {
    component.forceUpdate();
  }
};

// TODO is there a better way to distinguish cursors from single record
// responses?
export const isCursor = x => (
  x && typeof x === 'object' && typeof x.toArray === 'function'
);
