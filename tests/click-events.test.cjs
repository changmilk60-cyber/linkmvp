const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function tracker(pixel = true) {
  const calls = [], visits = [];
  const context = { exports: {}, require, window: pixel ? { fbq: (...args) => calls.push(args) } : {},
    fetch: (url, options) => { visits.push(JSON.parse(options.body)); return Promise.resolve(); } };
  const source = fs.readFileSync('app/[slug]/Tracker.tsx', 'utf8').replace('function track(', 'export function track(');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020,
  } }).outputText, context);
  return { track: context.exports.track, calls, visits };
}
test('signup click sends one custom event and preserves internal statistics', () => {
  const t = tracker(); t.track('demo', 'click_signup', 'SignupClick');
  assert.deepEqual(t.calls, [['trackCustom', 'SignupClick']]);
  assert.deepEqual(t.visits, [{ slug: 'demo', kind: 'click_signup' }]);
});
test('LINE keeps Contact and page views do not emit extra Meta events', () => {
  const t = tracker(); t.track('demo', 'click_line', 'Contact'); t.track('demo', 'view');
  assert.deepEqual(t.calls, [['track', 'Contact']]);
});
test('blocked or disabled Pixel does not break navigation tracking', () => {
  const t = tracker(false); t.track('demo', 'click_signup', 'SignupClick');
  assert.equal(t.calls.length, 0); assert.equal(t.visits.length, 1);
});
