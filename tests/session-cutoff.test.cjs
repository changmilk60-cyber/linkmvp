const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// isTokenStale decides whether a session cookie predates the account's
// password. It is pure, so it is loaded on its own rather than through the
// whole auth module, which needs cookies and a database.
function load() {
  const src = fs.readFileSync('lib/auth.ts', 'utf8');
  const fn = src.slice(src.indexOf('export function isTokenStale'));
  const out = ts.transpileModule('export {};' + fn.slice(0, fn.indexOf('\n}') + 2), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {} };
  vm.runInNewContext(out, context);
  return context.exports.isTokenStale;
}

const isTokenStale = load();
const at = (ms) => new Date(ms);

test('a session minted in the same second as the password is still valid', () => {
  // Regression: the database default writes passwordChangedAt with
  // milliseconds, while a JWT iat is whole seconds. Comparing them directly
  // made every freshly issued token look up to 999ms too old, which signed
  // new accounts straight back out at sign-up.
  assert.equal(isTokenStale(1_700_000_013, at(1_700_000_013_585)), false);
  assert.equal(isTokenStale(1_700_000_013, at(1_700_000_013_000)), false);
  assert.equal(isTokenStale(1_700_000_013, at(1_700_000_013_999)), false);
});

test('a session from before the password change is rejected', () => {
  assert.equal(isTokenStale(1_700_000_012, at(1_700_000_013_000)), true);
  assert.equal(isTokenStale(1_699_000_000, at(1_700_000_000_000)), true);
});

test('a session issued after the password change is kept', () => {
  assert.equal(isTokenStale(1_700_000_014, at(1_700_000_013_585)), false);
});

test('a token with no issued-at is treated as stale', () => {
  assert.equal(isTokenStale(undefined, at(1_700_000_013_000)), true);
});
