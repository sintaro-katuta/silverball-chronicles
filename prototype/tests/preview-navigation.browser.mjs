import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const base = process.env.REVIEW_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
 const page = await browser.newPage({viewport: {width: 390, height: 844}});
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 page.on('response', response => {
  if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
 });
 for (const [path, ready] of [
  ['/dev/board-pixi.html', '__board'],
  ['/dev/parts.html', '__partsReady'],
  ['/dev/reach-comparison.html', '__reachComparison'],
  ['/tools/bake-models.html', 'bakeBoard']
 ]) {
  await page.goto(base + path);
  await page.waitForFunction(name => !!window[name], ready, {timeout: 60000});
 }
 assert.deepEqual(errors, []);
 console.log('Preview navigation passed: PixiJS board, PlayCanvas parts, reach comparison and GLB authoring initialize without errors.');
} finally {
 await browser.close();
}
