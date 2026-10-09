import {browserLaunchOptions} from './browser-launch.js';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {RELEASE_ASSETS} from '../tools/release-assets.js';

const url = process.env.REVIEW_URL ?? 'http://127.0.0.1:4178';
const browser = await chromium.launch(browserLaunchOptions());
console.log('Chrome:',browser.version());
try {
 for (const viewport of [{width: 390, height: 844}, {width: 1440, height: 900}]) {
  const page = await browser.newPage({viewport});
  const errors = [], loaded = new Set();
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => {
   if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
   if (response.ok()) loaded.add(new URL(response.url()).pathname.slice(1).replace(/^game-art\//,'').replace(/-[a-f0-9]{16}\.webp$/,'.png'));
  });
  await page.goto(url);
  await page.locator('[data-kind=main]').first().click();
  await page.locator('#playMachine').click();
  await page.locator('#intro-skip').click();
  await page.locator('#controls-toggle').click();
  assert.equal(Number(await page.locator('#power-control').inputValue()), 0.20);
  assert.equal(await page.evaluate(() => window.__session.snapshot().pockets.find(p => p.kind === 'start').w), 20);
  await page.locator('#menu').click();
  assert.equal(await page.evaluate(() => window.__session.snapshot().paused), true);
  await page.locator('#resume').click();
  assert.equal(await page.evaluate(() => window.__session.snapshot().paused), false);
  assert.deepEqual(RELEASE_ASSETS.filter(name => !loaded.has(name)), [], 'All release images must load in real play');
  assert.deepEqual(errors, []);
  console.log('Main script:', [...loaded].filter(name => /^assets\/game-.*\.js$/.test(name)));
  console.log(`Release passed ${viewport.width}x${viewport.height}: all ${RELEASE_ASSETS.length} images loaded, pause/resume, no HTTP or browser errors.`);
  await page.close();
 }
} finally { await browser.close(); }
