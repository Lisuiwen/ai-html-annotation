import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthorSession, IDLE_MS, samePath, TAB_CLOSE_GRACE_MS } from '../../../skills/html-prototype-build/runtime/server/session.mjs';

function clock() {
  const pending = [];
  let next = 1;
  return {
    schedule(fn, ms) {
      const id = next++;
      pending.push({ id, fn, ms });
      return id;
    },
    cancel(id) {
      const index = pending.findIndex((timer) => timer.id === id);
      if (index >= 0) pending.splice(index, 1);
    },
    due(ms) {
      return pending.filter((timer) => timer.ms === ms);
    }
  };
}

test('author session: idle exit is two hours, and a hello keeps it alive', () => {
  const timers = clock();
  const reasons = [];
  const session = createAuthorSession({
    onStop: (reason) => reasons.push(reason),
    schedule: timers.schedule,
    cancel: timers.cancel
  });
  assert.equal(timers.due(IDLE_MS).length, 1);
  assert.equal(IDLE_MS, 2 * 60 * 60 * 1000);
  session.hello('tab-1');
  assert.equal(timers.due(IDLE_MS).length, 1);
  timers.due(IDLE_MS)[0].fn();
  assert.deepEqual(reasons, ['idle']);
});

test('author session: the last tab close waits three minutes, and another tab cancels it', () => {
  const timers = clock();
  const reasons = [];
  const session = createAuthorSession({
    onStop: (reason) => reasons.push(reason),
    schedule: timers.schedule,
    cancel: timers.cancel
  });
  session.hello('tab-1');
  session.hello('tab-2');
  session.leave('tab-1');
  assert.equal(timers.due(TAB_CLOSE_GRACE_MS).length, 0);
  session.leave('tab-2');
  assert.equal(TAB_CLOSE_GRACE_MS, 3 * 60 * 1000);
  assert.equal(timers.due(TAB_CLOSE_GRACE_MS).length, 1);
  session.hello('tab-3');
  assert.equal(timers.due(TAB_CLOSE_GRACE_MS).length, 0);
  assert.deepEqual(reasons, []);
});

test('author session: paths match across slash and windows case differences', () => {
  assert.equal(samePath('', ''), true);
  assert.equal(samePath('e:/demo/a.html', 'e:/demo/b.html'), false);
  if (process.platform === 'win32') {
    assert.equal(samePath('e:/demo/prototype.html', 'e:\\demo\\Prototype.html'), true);
  }
});
