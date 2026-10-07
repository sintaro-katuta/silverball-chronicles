import {defineConfig} from 'vite';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {copyReleaseAssets,prepareReleaseAssets} from './tools/release-assets.js';

const entry = path => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(async ({mode}) => {
 const art=mode==='release'?await prepareReleaseAssets(entry('./public/'),entry('./.cache/game-art/')):null;
 return ({
 define: art?{'import.meta.env.BOARD_ASSET_URLS':JSON.stringify(art.urls)}:{},
 publicDir: mode === 'release' ? false : 'public',
 plugins: mode === 'release' ? [{
  name: 'release-assets',
  closeBundle() { copyReleaseAssets(art, entry('./dist-release/'));
   console.log(`Game art: ${(art.originalBytes/1024**2).toFixed(2)} → ${(art.optimizedBytes/1024**2).toFixed(2)} MiB`); }
 }] : [],
 server: {watch: {usePolling: true, interval: 300}},
 build: {
  outDir: mode === 'release' ? 'dist-release' : 'dist',
  rollupOptions: {
   input: mode === 'previews'
    ? Object.fromEntries(readdirSync(entry('./dev/'))
      .filter(name => name.endsWith('.html'))
      .map(name => [name.slice(0, -5), entry(`./dev/${name}`)]))
    : {game: entry('./index.html')}
  }
 }
});
});
