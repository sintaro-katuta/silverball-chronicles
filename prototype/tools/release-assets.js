import {copyFileSync, mkdirSync, readFileSync, statSync, existsSync, writeFileSync, renameSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {BOARD_ART, BOARD_ART_URLS} from '../src/pixi/board-assets.js';

export const RELEASE_ASSETS = Object.freeze(BOARD_ART_URLS.map(url => url.slice(1)));
export const LOSSLESS_ART = new Set([BOARD_ART.central, BOARD_ART.normal, BOARD_ART.tulipAtlas, BOARD_ART.frameTexture]);
export function assertAssetSize(bytes, name) {
 if (bytes > 25 * 1024 * 1024) throw new Error(`Cloudflare asset exceeds 25 MiB: ${name}`);
}

export async function prepareReleaseAssets(publicDir, cacheDir) {
 mkdirSync(cacheDir, {recursive: true});
 const files = [], urls = {};
 let originalBytes = 0, optimizedBytes = 0;
 for (const url of BOARD_ART_URLS) {
  const source = resolve(publicDir, url.slice(1));
  const options = {lossless: LOSSLESS_ART.has(url), quality: 95, alphaQuality: 100, effort: 4};
  const input = readFileSync(source);
  const digest = createHash('sha256').update(input).update(JSON.stringify({options, versions: sharp.versions})).digest('hex').slice(0, 16);
  const name = `game-art/${url.slice(1, -4)}-${digest}.webp`;
  const cached = resolve(cacheDir, `${digest}.webp`);
  if (!existsSync(cached)) {
   // Interrupted builds must not leave a partial image that a later build reuses.
   const encoded = await sharp(input).webp(options).toBuffer();
   assertAssetSize(encoded.length, name);
   const temporary = `${cached}.${process.pid}.tmp`;
   writeFileSync(temporary, encoded);
   renameSync(temporary, cached);
  }
  const bytes = statSync(cached).size;
  assertAssetSize(bytes, name);
  urls[url] = `/${name}`;
  files.push({source: cached, name});
  originalBytes += input.length; optimizedBytes += bytes;
 }
 return {files, urls, originalBytes, optimizedBytes};
}

export function copyReleaseAssets(prepared, outputDir) {
 for (const {source, name} of prepared.files) {
  assertAssetSize(statSync(source).size, name);
  const target = resolve(outputDir, name);
  mkdirSync(dirname(target), {recursive: true});
  copyFileSync(source, target);
 }
 writeFileSync(resolve(outputDir, '_headers'), '/game-art/*\n  Cache-Control: public, max-age=31536000, immutable\n');
}
