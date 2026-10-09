import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardAssetLoader} from '../src/pixi/board-asset-loader.js';
import {BOARD_ART_URLS, BOARD_ART, selectedBoardArt} from '../src/pixi/board-assets.js';

test('prefetch and mount start all art in parallel and share in-flight/cache requests', async () => {
 const requested = new Map(), progress = [];let calls=0;
 const load = createBoardAssetLoader(url => new Promise(resolve => {calls++;requested.set(url, resolve);}));
 const first = load(undefined, p => progress.push(p)), second = load();
 await Promise.resolve();
 assert.equal(requested.size, 25);assert.equal(calls,25);
 for (const [url, resolve] of requested) resolve({url});
 const [a, b] = await Promise.all([first, second]);
 assert.deepEqual(a, b);
 assert.equal(Object.keys(a.entrySheets).length, 6);
 assert.equal(Object.keys(a.storySheets).length, 5);
 assert.equal(a.cabinetPortrait.url, BOARD_ART.cabinetPortrait);
 assert.equal(progress.at(-1), 1);
 assert.ok(progress.every((p, i) => i === 0 || p > progress[i - 1]));
 await load();assert.equal(requested.size, BOARD_ART_URLS.length);assert.equal(calls,25);
});

test('failed requests can retry without refetching successful art', async () => {
 const calls = new Map();
 const load = createBoardAssetLoader(async url => {
  calls.set(url, (calls.get(url) ?? 0) + 1);
  if (url === BOARD_ART.lcdTexture && calls.get(url) === 1) throw new Error('offline');
  return {url};
 });
 await assert.rejects(load(), /offline/);
 await load();
 assert.equal(calls.get(BOARD_ART.lcdTexture), 2);
 assert.ok([...calls].filter(([url]) => url !== BOARD_ART.lcdTexture).every(([, count]) => count === 1));
});

test('parts previews load only assets for their selected features', () => {
 const minimal = selectedBoardArt({lcd: false, spin: false, production: false});
 assert.deepEqual(minimal.map(([key]) => key), ['central', 'normal', 'tulipAtlas']);
});
