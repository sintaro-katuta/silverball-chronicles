import {defineConfig} from 'vite';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const entry = path => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({mode}) => ({
 server: {watch: {usePolling: true, interval: 300}},
 build: {
  rollupOptions: {
   input: mode === 'previews'
    ? Object.fromEntries(readdirSync(entry('./dev/'))
      .filter(name => name.endsWith('.html'))
      .map(name => [name.slice(0, -5), entry(`./dev/${name}`)]))
    : {game: entry('./index.html')}
  }
 }
}));
