import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {prepareReleaseAssets, copyReleaseAssets, RELEASE_ASSETS, LOSSLESS_ART, assertAssetSize} from '../tools/release-assets.js';

test('release optimizes only gameplay art, preserves dimensions/alpha/originals and lossless pixel art', async () => {
 const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
 const temp = mkdtempSync(join(tmpdir(), 'tsukikage-release-'));
 const files = dir => readdirSync(dir, {withFileTypes: true}).flatMap(e =>
  e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]);
 try {
  const before = RELEASE_ASSETS.map(name => readFileSync(join(publicDir, name)));
  const prepared = await prepareReleaseAssets(publicDir, join(temp, 'cache'));
  const out = join(temp, 'out');
  copyReleaseAssets(prepared, out);
  assert.equal(files(out).length, RELEASE_ASSETS.length + 1);
  assert.ok(prepared.optimizedBytes < prepared.originalBytes * .4);
  for (const [i, name] of RELEASE_ASSETS.entries()) {
   const url = prepared.urls['/' + name];
   assert.match(url, /^\/game-art\/.+-[a-f0-9]{16}\.webp$/);
   assert.deepEqual(readFileSync(join(publicDir, name)), before[i]);
   const original = await sharp(before[i]).ensureAlpha().raw().toBuffer({resolveWithObject: true});
   const encoded = await sharp(join(out, url.slice(1))).ensureAlpha().raw().toBuffer({resolveWithObject: true});
   assert.deepEqual(encoded.info, original.info);
   let error = 0, weight = 0;
   for (let p = 0; p < original.data.length; p += 4) {
    assert.equal(encoded.data[p + 3], original.data[p + 3], `${name} alpha`);
    for (let channel = 0; channel < 3; channel++) {
     const delta = Math.abs(encoded.data[p + channel] - original.data[p + channel]);
     if (original.data[p + 3] && LOSSLESS_ART.has('/' + name)) assert.equal(delta, 0, `${name} pixel art`);
     error += delta * original.data[p + 3]; weight += original.data[p + 3];
    }
   }
   assert.ok(error / Math.max(weight, 1) < 4, `${name}: visible RGB mean error ${error / weight}`);
  }
  assert.match(readFileSync(join(out, '_headers'), 'utf8'), /max-age=31536000, immutable/);
  assert.equal(RELEASE_ASSETS.some(p => /^(models|battles)\//.test(p)), false);
 } finally { rmSync(temp, {recursive: true, force: true}); }
});

test('Cloudflare size guard accepts the exact limit and rejects oversized assets', () => {
 assert.doesNotThrow(() => assertAssetSize(25 * 1024 * 1024, 'boundary.webp'));
 assert.throws(() => assertAssetSize(25 * 1024 * 1024 + 1, 'too-big.webp'), /exceeds 25 MiB/);
});
