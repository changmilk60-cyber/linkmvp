const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// lib/sections.ts has no imports, so the helpers can be loaded on their own.
function load() {
  const out = ts.transpileModule(fs.readFileSync('lib/sections.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, require };
  vm.runInNewContext(out, context);
  return context.exports;
}
const { isShortsUrl, resolveVideoOrientation, normalizeVideoLayout, normalizePlayMode, extractYoutubeId } = load();

test('a Shorts link is recognised, ordinary links are not', () => {
  assert.equal(isShortsUrl('https://www.youtube.com/shorts/abcdefghijk'), true);
  assert.equal(isShortsUrl('  youtube.com/shorts/abcdefghijk?feature=share '), true);
  assert.equal(isShortsUrl('https://www.youtube.com/watch?v=abcdefghijk'), false);
  assert.equal(isShortsUrl('https://youtu.be/abcdefghijk'), false);
  assert.equal(isShortsUrl(''), false);
});

test('auto picks portrait only from a Shorts link', () => {
  assert.equal(resolveVideoOrientation('https://youtube.com/shorts/abcdefghijk', 'auto'), 'portrait');
  assert.equal(resolveVideoOrientation('https://youtube.com/shorts/abcdefghijk'), 'portrait');
  assert.equal(resolveVideoOrientation('https://youtube.com/watch?v=abcdefghijk', 'auto'), 'landscape');
});

test('the owner\'s choice always beats the guess', () => {
  // A vertical clip pasted as a normal watch link: only the owner can know.
  assert.equal(resolveVideoOrientation('https://youtube.com/watch?v=abcdefghijk', 'portrait'), 'portrait');
  // A Shorts link the owner wants wide.
  assert.equal(resolveVideoOrientation('https://youtube.com/shorts/abcdefghijk', 'landscape'), 'landscape');
});

test('unknown stored values fall back safely', () => {
  assert.equal(normalizeVideoLayout('weird'), 'auto');
  assert.equal(normalizeVideoLayout(undefined), 'auto');
  assert.equal(normalizeVideoLayout('portrait'), 'portrait');
  assert.equal(normalizePlayMode('weird'), 'click');
  assert.equal(normalizePlayMode(undefined), 'click');
  assert.equal(normalizePlayMode('autoplay'), 'autoplay');
});

test('a Shorts link still yields a video id', () => {
  assert.equal(extractYoutubeId('https://www.youtube.com/shorts/abcdefghijk'), 'abcdefghijk');
});
