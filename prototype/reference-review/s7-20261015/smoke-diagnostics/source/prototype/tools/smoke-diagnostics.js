import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultDirectory = fileURLToPath(new URL('../.cache/release/smoke-failures/', import.meta.url));
export async function captureSmokeFailure(page, {viewport, navigation, errors, consoleErrors, error}, {
 directory = process.env.SMOKE_FAILURE_OUTPUT ?? defaultDirectory, log = (...args) => console.error(...args),
} = {}) {
 const prefix = `${viewport.width}x${viewport.height}-${Date.now()}`;
 const diagnosticErrors = [];
 const bounded = async (label, operation) => {
  let timer;
  try {
   return await Promise.race([operation(), new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('diagnostic capture deadline')), 2000);
   })]);
  } catch (failure) { diagnosticErrors.push(`${label}: ${failure.message}`); return null; }
  finally { clearTimeout(timer); }
 };
 const [documentState, html, screenshot] = await Promise.all([
  bounded('document', () => page.evaluate(() => ({title: document.title.slice(0, 500), body: (document.body?.innerText ?? '').slice(0, 8000)}))),
  bounded('HTML', () => page.content()),
  bounded('screenshot', () => page.screenshot({timeout: 2000})),
 ]);
 const evidence = {viewport, navigation, finalURL: page.url(), originalError: error.message,
  errors: errors.slice(-100).map(value => value.slice(0, 2000)),
  consoleErrors: consoleErrors.slice(-100).map(value => value.slice(0, 2000)),
  documentState, diagnosticErrors, htmlTruncated: html !== null && html.length > 1000000};
 try {
  await mkdir(directory, {recursive: true});
  const results = await Promise.allSettled([
   writeFile(join(directory, `${prefix}.json`), JSON.stringify(evidence, null, 2) + '\n'),
   ...(html === null ? [] : [writeFile(join(directory, `${prefix}.html`), html.slice(0, 1000000))]),
   ...(screenshot === null ? [] : [writeFile(join(directory, `${prefix}.png`), screenshot)]),
  ]);
  for (const result of results) if (result.status === 'rejected') log('Smoke failure evidence write failed:', result.reason.message);
 } catch (failure) { log('Smoke failure directory unavailable:', failure.message); }
 log('Smoke failure diagnostic:', JSON.stringify(evidence));
 return evidence;
}

// Cleanup must not replace the failure that caused the diagnostic capture.
export async function closeSmokeResource(resource, originalError, log = (...args) => console.error(...args)) {
 try { await resource.close(); }
 catch (error) { if (!originalError) throw error; log('Smoke cleanup failed:', error.message); }
}
