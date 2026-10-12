import { resolve } from 'node:path';

export const IDLE_MS = 2 * 60 * 60 * 1000;
export const TAB_CLOSE_GRACE_MS = 3 * 60 * 1000;

export function samePath(left, right) {
  const a = left ? resolve(left) : '';
  const b = right ? resolve(right) : '';
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

export function createAuthorSession({ onStop, schedule = setTimeout, cancel = clearTimeout }) {
  const tabs = new Set();
  let idleTimer = null;
  let graceTimer = null;
  let stopped = false;

  function stop(reason) {
    if (stopped) return;
    stopped = true;
    cancel(idleTimer);
    cancel(graceTimer);
    idleTimer = null;
    graceTimer = null;
    onStop(reason);
  }

  function noteActivity() {
    if (stopped) return;
    cancel(idleTimer);
    idleTimer = schedule(() => stop('idle'), IDLE_MS);
  }

  function hello(tabId) {
    if (!tabId || stopped) return;
    tabs.add(String(tabId));
    cancel(graceTimer);
    graceTimer = null;
    noteActivity();
  }

  function leave(tabId) {
    if (stopped) return;
    if (tabId) tabs.delete(String(tabId));
    noteActivity();
    if (tabs.size > 0) return;
    cancel(graceTimer);
    graceTimer = schedule(() => stop('tabs'), TAB_CLOSE_GRACE_MS);
  }

  noteActivity();

  return { hello, leave, noteActivity, stop };
}
