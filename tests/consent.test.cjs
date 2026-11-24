const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load() {
  const out = ts.transpileModule(fs.readFileSync('lib/policy.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {} };
  vm.runInNewContext(out, context);
  return context.exports;
}
const { needsConsent, POLICY_VERSION } = load();

test('a first-time visitor is asked', () => {
  assert.equal(needsConsent(null), true);
  assert.equal(needsConsent(undefined), true);
  assert.equal(needsConsent(''), true);
});

test('someone who accepted the current version is not asked again', () => {
  assert.equal(needsConsent(POLICY_VERSION), false);
});

test('someone who accepted an older version is asked again', () => {
  assert.equal(needsConsent('2020-01-01'), true);
});

test('the consent box is never mounted on a customer sales page, the root layout or the admin', () => {
  // The root layout also wraps every sales page; a box covering the page
  // before the sign-up button would cost the customer conversions.
  for (const f of ['app/layout.tsx', 'app/[slug]/page.tsx', 'app/[slug]/SalesPage.tsx', 'app/dashboard/page.tsx', 'app/superadmin/page.tsx']) {
    assert.equal(fs.readFileSync(f, 'utf8').includes('ConsentBanner'), false, f);
  }
});

test('the Pixel notice is drawn only when a Pixel is configured, and outside the reorderable sections', () => {
  const src = fs.readFileSync('app/[slug]/SalesPage.tsx', 'utf8');
  // Conditional on at least one enabled Pixel id (page.tsx already empties the
  // list when the Pixel is switched off).
  assert.match(src, /fbPixelIds\.length > 0 \? <PixelNotice/);
  // Rendered after the sections map, not as one of the sections the owner can reorder.
  const mapAt = src.indexOf('sections.map((s)');
  const noticeAt = src.indexOf('<PixelNotice');
  assert.ok(mapAt > 0 && noticeAt > mapAt, 'notice must come after the section list');
  assert.equal(src.includes('case "pixel_notice"'), false);
  // Links to the policy and opens it in a new tab so an ad visitor keeps the page.
  assert.match(src, /href="\/privacy" target="_blank" rel="noopener"/);
});
