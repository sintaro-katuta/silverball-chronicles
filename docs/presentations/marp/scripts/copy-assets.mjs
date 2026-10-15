import { cpSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
cpSync('assets', 'dist/assets', { recursive: true });
if (existsSync('index.html')) copyFileSync('index.html', 'dist/slides.html');
