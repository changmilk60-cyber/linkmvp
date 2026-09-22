const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const code = ts.transpileModule(fs.readFileSync('lib/meta-pixel.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(code, context);
const parse = (input) => Array.from(context.exports.parseMetaPixelIds(input));

test('accepts a full Meta base code and deduplicates IDs', () => {
  assert.deepEqual(parse(`<!-- Meta Pixel Code --><script>
    fbq('init', '123456789012345'); fbq("init", "123456789012345");
    fbq('track', 'PageView');</script>
    <noscript><img src="https://www.facebook.com/tr?id=123456789012345&ev=PageView&noscript=1" /></noscript>`), ['123456789012345']);
});
test('supports existing manual IDs and clearing the configuration', () => {
  assert.deepEqual(parse('123456789, 987654321\n123456789'), ['123456789', '987654321']);
  assert.deepEqual(parse('  '), []);
});
test('invalid input fails instead of silently deleting a working Pixel', () => {
  for (const input of ['123', '123456\nwrong', "fbq('init', 'YOUR_PIXEL_ID');", '<script>alert(1)</script>', 'x'.repeat(20001)]) {
    assert.throws(() => parse(input));
  }
});
test('pasted JavaScript is never executed', () => {
  assert.deepEqual(parse("throw new Error('executed'); fbq('init', '123456789');"), ['123456789']);
});
test('each rendered Pixel sends PageView only to its own ID', () => {
  const source = fs.readFileSync('app/[slug]/SalesPage.tsx', 'utf8');
  const script = source.match(/\{`(!function[\s\S]*?)`\}/)[1];
  const calls = [];
  const sandbox = { window: { fbq() {} }, document: {}, fbq: (...args) => calls.push(args) };
  for (const id of ['123456789', '987654321']) vm.runInNewContext(script.replaceAll('${id}', id), sandbox);
  assert.deepEqual(calls.filter((args) => args[0] === 'trackSingle'), [
    ['trackSingle', '123456789', 'PageView'], ['trackSingle', '987654321', 'PageView'],
  ]);
  assert.equal(calls.filter((args) => args[0] === 'track').length, 0);
});
