import {browserLaunchOptions} from './browser-launch.js';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {RELEASE_ASSETS} from '../tools/release-assets.js';
import {captureSmokeFailure, closeSmokeResource} from '../tools/smoke-diagnostics.js';

const url = process.env.REVIEW_URL ?? 'http://127.0.0.1:4178';
const browser = await chromium.launch(browserLaunchOptions());
console.log('Chrome:',browser.version());
let primaryFailure = null;
try {
 for (const viewport of [{width: 390, height: 844}, {width: 1440, height: 900}]) {
  const page = await browser.newPage({viewport});
  const errors = [], consoleErrors = [], loaded = new Set();
  let navigation = null, smokeError = null;
  page.on('console', message => {
   if (message.type() === 'error') {
    consoleErrors.push(message.text().slice(0, 2000));
    if (consoleErrors.length > 100) consoleErrors.shift();
   }
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => {
   if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`);
   if (response.ok()) loaded.add(new URL(response.url()).pathname.slice(1).replace(/^game-art\//,'').replace(/-[a-f0-9]{16}\.webp$/,'.png'));
  });
  try {
   const response = await page.goto(url);
   navigation = response ? {status: response.status(), url: response.url()} : null;
   await page.locator('[data-kind=main]').first().click();
   await page.locator('#playMachine').click();
   await page.locator('#intro-skip').click();
   await page.locator('#controls-toggle').click();
   assert.equal(Number(await page.locator('#power-control').inputValue()), 0.18);
   assert.equal(await page.locator('#power-label').innerText(), '0.18');
   assert.deepEqual(await page.locator('#power-control').evaluate(el => [el.min, el.max, el.step]), ['0.18', '0.30', '0.01']);
   await page.waitForFunction(() => (__session.snapshot()?.leftRoutes?.byPower?.['0.18']?.tracked ?? 0) > 0);
   assert.equal(await page.evaluate(() => window.__session.snapshot().pockets.find(p => p.kind === 'start').w), 20);
   await page.locator('#menu').click();
   assert.equal(await page.evaluate(() => window.__session.snapshot().paused), true);
   await page.locator('#resume').click();
   assert.equal(await page.evaluate(() => window.__session.snapshot().paused), false);
   assert.deepEqual(RELEASE_ASSETS.filter(name => !loaded.has(name)), [], 'All release images must load in real play');
   assert.deepEqual(errors, []);
   console.log('Main script:', [...loaded].filter(name => /^assets\/game-.*\.js$/.test(name)));
   console.log(`Release passed ${viewport.width}x${viewport.height}: all ${RELEASE_ASSETS.length} images loaded, pause/resume, no HTTP or browser errors.`);
  } catch (error) {
   smokeError = error;
   try { await captureSmokeFailure(page, {viewport, navigation, errors, consoleErrors, error}); }
   catch (diagnosticError) { console.error('Smoke failure diagnostic failed:', diagnosticError.message); }
   throw error;
  } finally { await closeSmokeResource(page, smokeError); }
 }
} catch (error) { primaryFailure = error; throw error; }
finally { await closeSmokeResource(browser, primaryFailure); }
