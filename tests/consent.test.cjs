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

test('the consent bar lives on the home page and, behind the owner\'s switch, on sales pages - nowhere else', () => {
  // The root layout wraps every sales page, so it must not carry the bar: a
  // page whose owner switched the notice off must stay clean.
  const clean = [
    'app/layout.tsx', 'app/[slug]/page.tsx',
    'app/dashboard/page.tsx', 'app/superadmin/page.tsx', 'app/privacy/page.tsx',
    'app/login/page.tsx', 'app/register/page.tsx', 'app/forgot-password/page.tsx',
  ];
  for (const f of clean) {
    assert.equal(fs.readFileSync(f, 'utf8').includes('ConsentBanner'), false, f);
  }
  assert.equal(fs.readFileSync('app/page.tsx', 'utf8').includes('<ConsentBanner'), true);

  // On a sales page it is only drawn when the owner has the notice switched on,
  // and it is the compact, theme-coloured, in-page-spacer variant.
  const sales = fs.readFileSync('app/[slug]/SalesPage.tsx', 'utf8');
  assert.match(sales, /privacyNotice \? \(\s*<ConsentBanner\s+compact\s+reserve="inline"/);
  assert.match(sales, /look=\{consentLook\(primary, theme\.accent, textBody\)\}/);
});

test('button text on the sales-page bar is chosen by real contrast, not a brightness cut-off', () => {
  // A cut-off picks white text for mid-tones such as orange and teal, which
  // reads at only ~2.6:1; comparing against both black and white does not.
  const sales = fs.readFileSync('app/[slug]/SalesPage.tsx', 'utf8');
  assert.match(sales, /againstBlack >= againstWhite/);
  assert.equal(/lum > 0\.4/.test(sales), false);
});

test('the privacy notice follows the owner\'s switch, sits outside the reorderable sections, and its wording follows the Pixel', () => {
  const src = fs.readFileSync('app/[slug]/SalesPage.tsx', 'utf8');
  // Drawn only when the owner has it switched on...
  assert.match(src, /privacyNotice \? <PrivacyNotice usesPixel=\{fbPixelIds\.length > 0\}/);
  // ...after the sections map, not as one of the sections the owner can reorder.
  const mapAt = src.indexOf('sections.map((s)');
  const noticeAt = src.indexOf('<PrivacyNotice');
  assert.ok(mapAt > 0 && noticeAt > mapAt, 'notice must come after the section list');
  assert.equal(src.includes('case "privacy_notice"'), false);
  // The Meta sentence is only used when a Pixel really runs; otherwise it would be untrue.
  assert.match(src, /usesPixel\s*\?\s*"หน้านี้ใช้ Meta Pixel/);
  assert.match(src, /: "หน้านี้ใช้คุกกี้เพื่อนับสถิติการเข้าชม"/);
  // Links to the policy and opens it in a new tab so an ad visitor keeps the page.
  assert.match(src, /href="\/privacy" target="_blank" rel="noopener"/);
});

test('the admin can save the switch under its own scope', () => {
  const act = fs.readFileSync('app/actions.ts', 'utf8');
  assert.match(act, /"privacy"/);
  assert.match(act, /wants\("privacy"\)/);
  assert.match(act, /privacyNoticeEnabled = formData\.get\("privacyNoticeEnabled"\) === "on"/);
});
