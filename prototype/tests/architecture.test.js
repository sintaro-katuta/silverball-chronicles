import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {dirname, resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const source = fileURLToPath(new URL('../src/', import.meta.url));
function files(dir) {
 return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? files(path) : /\.(?:js|mjs|css)$/.test(entry.name) ? [path] : [];
 });
}
function imports(path) {
 const code = readFileSync(path, 'utf8');
 return [...code.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|@import\s*)['"]([^'"]+)['"]/g)].map(match => match[1]);
}

test('all source imports resolve after directory changes', () => {
 for (const path of files(source)) {
  for (const specifier of imports(path).filter(value => value.startsWith('.'))) {
   assert.ok(existsSync(resolve(dirname(path), specifier)), `${path}: ${specifier}`);
  }
 }
});

test('gameplay and physics dependency graphs remain independent of browser renderers', () => {
 const visited = new Set();
 function visit(path) {
  if (visited.has(path)) return;
  visited.add(path);
  assert.ok(['domain', 'physics', 'presentation'].includes(path.slice(source.length).split('/')[0]), path);
  for (const specifier of imports(path)) {
   assert.equal(/^(?:pixi\.js|playcanvas|three|@capacitor)(?:\/|$)/.test(specifier), false, `${path}: ${specifier}`);
   if (specifier.startsWith('.')) {
    const next = resolve(dirname(path), specifier);
    if (['.js', '.mjs'].includes(extname(next))) visit(next);
   }
  }
 }
 for (const dir of ['domain', 'physics', 'presentation']) {
  for (const path of files(resolve(source, dir))) visit(path);
 }
});
