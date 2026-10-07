import {chromium} from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.REVIEW_URL ?? 'http://127.0.0.1:4178';
const dir = process.env.LOADING_DIR ?? 'reference-review/loading-2026-10-06/after';
await mkdir(dir, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
 const page = await browser.newPage({viewport: {width: 390, height: 844}});
 const errors = [], imageBytes = new Map();
 page.on('pageerror', error => errors.push(error.message));
 page.on('response', response => { if (/\.(png|webp)$/.test(new URL(response.url()).pathname)) imageBytes.set(response.url(), Number(response.headers()['content-length']??0)); if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
 const cdp = await page.context().newCDPSession(page);
 await cdp.send('Network.enable');
 await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
 await cdp.send('Network.emulateNetworkConditions', {
  offline: false, latency: 60, downloadThroughput: 10_000_000 / 8, uploadThroughput: 1_000_000 / 8
 });
 await page.goto(url);
 await page.locator('[data-kind=main]').first().click();
 const start = performance.now();
 await page.locator('#playMachine').click();
 await page.locator('#machine-loading').waitFor({state: 'detached', timeout: 120000});
 const readyMs = performance.now() - start;
 await page.locator('#intro-skip').click();
 await page.locator('#controls-toggle').click();
 await page.locator('#feed-toggle').click();
 await page.locator('#menu').click();
 const paused = await page.evaluate(() => __session.snapshot());
 await page.waitForTimeout(250);
 assert.equal(await page.evaluate(() => __session.snapshot().time), paused.time);
 await page.locator('#resume').click();
 assert.deepEqual(errors, []);
 const resources = await page.evaluate(() => performance.getEntriesByType('resource')
  .filter(r => /\.(png|webp)(?:\?|$)/.test(r.name))
  .map(r => ({url: new URL(r.name).pathname, startMs: r.startTime, durationMs: r.duration, bytes: r.encodedBodySize})));
 await page.screenshot({path: `${dir}/ready.png`});
 const result = {readyMs, imageMiB: [...imageBytes.values()].reduce((n, bytes) => n + bytes, 0) / 1024 ** 2,
  network: '10 Mbps down / 1 Mbps up, 60 ms latency, HTTP cache disabled', resources, errors};
 await writeFile(`${dir}/timing.json`, JSON.stringify(result, null, 2));
 console.log(JSON.stringify({readyMs: Math.round(readyMs), imageMiB: result.imageMiB.toFixed(2), errors}));
} finally { await browser.close(); }
