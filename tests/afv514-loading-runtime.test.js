'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'loading-screen.js'), 'utf8');

function createElement() {
  return {
    dataset: {},
    style: {},
    hidden: false,
    textContent: '',
    attributes: {},
    isConnected: true,
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector(selector) { return this.children?.[selector] || null; }
  };
}

function createHarness({ stylesLoaded = true, stylesThrows = false, storageThrows = false, missingWaiting = false, raf = 'run' } = {}) {
  const rootClasses = new Set(['arisu-loading-first-run']);
  const rootElement = {
    classList: {
      add(...names) { names.forEach(name => rootClasses.add(name)); },
      remove(...names) { names.forEach(name => rootClasses.delete(name)); }
    }
  };
  const rows = new Map();
  for (const key of ['dom', 'styles', 'final']) {
    const row = createElement();
    row.children = {
      '.boot-mark': createElement(),
      '.boot-status': createElement(),
      '.boot-message': createElement()
    };
    rows.set(key, row);
  }

  const progress = createElement();
  const progressText = createElement();
  const progressPercent = createElement();
  const waiting = createElement();
  const complete = createElement();
  complete.hidden = true;
  const track = createElement();
  const overlay = createElement();
  overlay.classList = {
    add(name) { overlay.classes ??= new Set(); overlay.classes.add(name); },
    remove(name) { overlay.classes?.delete(name); }
  };
  overlay.querySelector = selector => {
    const match = selector.match(/^\[data-check="(dom|styles|final)"\]$/);
    if (match) return rows.get(match[1]);
    return ({
      '.boot-progress-fill': progress,
      '.boot-progress-value': progressText,
      '.boot-progress-percent': progressPercent,
      '.boot-progress-waiting': missingWaiting ? null : waiting,
      '.boot-progress-complete': complete,
      '.boot-progress-track': track
    })[selector] || null;
  };
  overlay.remove = () => { overlay.isConnected = false; };

  const stored = { value: null, writes: 0 };
  const sessionStorage = {
    getItem() {
      if (storageThrows) throw new Error('storage unavailable');
      return stored.value;
    },
    setItem(key, value) {
      stored.writes += 1;
      stored.value = value;
    }
  };
  const timers = new Map();
  let timerId = 0;
  const window = {
    sessionStorage,
    __arisuLoadingFailOpenTimer: 999,
    addEventListener() {},
    removeEventListener() {},
    clearTimeout(id) { timers.delete(id); },
    setTimeout(callback) {
      const id = ++timerId;
      timers.set(id, true);
      queueMicrotask(() => {
        if (!timers.has(id)) return;
        timers.delete(id);
        callback();
      });
      return id;
    }
  };
  if (raf === 'run') window.requestAnimationFrame = callback => callback();
  if (raf === 'hold') window.requestAnimationFrame = () => 1;

  const document = {
    documentElement: rootElement,
    readyState: 'complete',
    querySelectorAll() {
      if (stylesThrows) throw new Error('stylesheet inspection failed');
      return [{ disabled: false, sheet: stylesLoaded ? {} : null }];
    },
    getElementById(id) { return id === 'arisu-loading-screen' ? overlay : null; }
  };

  vm.runInNewContext(source, { document, window, AbortController, Promise, Array, Map, Error, String });
  return { overlay, waiting, complete, progress, progressPercent, track, rows, stored, rootClasses, window };
}

test('AFV514 completes only after all required checks pass and removes the overlay after the exit fade', async () => {
  const h = createHarness();
  assert.equal(h.waiting.hidden, false);
  assert.equal(h.complete.hidden, true);
  assert.notEqual(h.progress.style.width, '100%');
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(h.rows.get('dom').dataset.state, 'ok');
  assert.equal(h.rows.get('styles').dataset.state, 'ok');
  assert.equal(h.rows.get('final').dataset.state, 'ok');
  assert.equal(h.progress.style.width, '100%');
  assert.equal(h.progressPercent.textContent, '100%');
  assert.equal(h.waiting.hidden, true);
  assert.equal(h.complete.hidden, false);
  assert.equal(h.stored.value, '1');
  assert.equal(h.stored.writes, 1);
  assert.equal(h.overlay.isConnected, false);
  assert.equal(h.rootClasses.has('arisu-loading-first-run'), false);
  assert.equal(h.window.__arisuLoadingFailOpenTimer, null);
});

test('AFV514 fails open on a failed stylesheet check without showing COMPLETE or persisting success', async () => {
  const h = createHarness({ stylesLoaded: false });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(h.rows.get('dom').dataset.state, 'ok');
  assert.equal(h.rows.get('styles').dataset.state, 'error');
  assert.equal(h.complete.hidden, true);
  assert.equal(h.stored.writes, 0);
  assert.equal(h.overlay.isConnected, false);
  assert.equal(h.rootClasses.has('arisu-loading-first-run'), false);
});

test('AFV514 fails open when checks throw, storage is unavailable, or required status markup is missing', async () => {
  const checkFailure = createHarness({ stylesThrows: true });
  const storageFailure = createHarness({ storageThrows: true });
  const markupFailure = createHarness({ missingWaiting: true });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(checkFailure.overlay.isConnected, false);
  assert.equal(storageFailure.overlay.isConnected, false);
  assert.equal(markupFailure.overlay.isConnected, false);
  assert.equal(checkFailure.complete.hidden, true);
  assert.equal(checkFailure.stored.writes, 0);
  assert.equal(storageFailure.stored.writes, 0);
  assert.equal(markupFailure.stored.writes, 0);
});

test('AFV514 has a timer fallback if requestAnimationFrame does not deliver the exit callback', async () => {
  const h = createHarness({ raf: 'hold' });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(h.complete.hidden, false);
  assert.equal(h.stored.value, '1');
  assert.equal(h.overlay.isConnected, false);
  assert.equal(h.rootClasses.has('arisu-loading-first-run'), false);
});

test('AFV514 limits live announcements to the changing startup statuses', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'loading-screen.css'), 'utf8');
  assert.match(html, /id="arisu-loading-screen" role="region" aria-label="Loading Arisu Fix homepage"/);
  assert.doesNotMatch(html, /id="arisu-loading-screen" role="status"/);
  assert.match(html, /class="boot-log" aria-live="polite"/);
  assert.match(html, /class="boot-progress-waiting" role="status" aria-live="polite"/);
  assert.doesNotMatch(css, /\.boot-log li\[data-state="pending"\]\s*\{/);
  assert.doesNotMatch(css, /\.boot-log li\[data-state="running"\]\s*\{\s*animation:/);
});
