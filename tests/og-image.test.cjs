const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup(owned = true) {
  let updated;
  const invalidated = [];
  const prisma = { page: {
    findFirst: async ({ where }) => owned && where.userId === 'owner' ? { id: 'page', slug: 'demo' } : null,
    update: async (args) => { updated = args.data; },
  } };
  const imports = {
    '@/lib/prisma': { prisma },
    '@/lib/auth': { getSessionUserId: async () => 'owner' },
    'next/cache': { revalidatePath: (path) => invalidated.push(path) },
    'next/navigation': { redirect: () => { throw new Error('redirect'); } },
    '@/lib/meta-pixel': {}, '@/lib/url': {}, '@/lib/sections': {}, nanoid: {},
  };
  const context = { exports: {}, FormData, File, process, require: (name) => name in imports ? imports[name] : require(name) };
  const source = ts.transpileModule(fs.readFileSync('app/actions.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, context);
  return { save: context.exports.saveSettingsAction, updated: () => updated, invalidated };
}
function form(remove) {
  const fd = new FormData();
  fd.set('pageId', 'page'); fd.set('_scope', 'main');
  if (remove) fd.set('remove_ogImage', 'on');
  return fd;
}
test('removal clears only the share-image reference and refreshes both pages', async () => {
  const app = setup();
  assert.equal((await app.save({}, form(true))).success, true);
  assert.equal(app.updated().ogImage, null);
  assert.equal('logoUrl' in app.updated(), false);
  assert.deepEqual(app.invalidated, ['/dashboard', '/demo']);
});
test('saving without removal preserves existing OG image', async () => {
  const app = setup(); await app.save({}, form(false));
  assert.equal('ogImage' in app.updated(), false);
});
test('cannot remove another account share image', async () => {
  const app = setup(false);
  assert.ok((await app.save({}, form(true))).error);
  assert.equal(app.updated(), undefined);
});
