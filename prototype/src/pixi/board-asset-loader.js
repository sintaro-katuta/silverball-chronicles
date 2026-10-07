import {Assets} from 'pixi.js';
import {boardAssetUrl, selectedBoardArt} from './board-assets.js';

// One in-flight promise per URL, shared by prefetch, mounting and re-entry.
export function createBoardAssetLoader(load) {
 const pending = new Map();
 return async (settings, onProgress = () => {}) => {
  const entries = selectedBoardArt(settings);
  let completed = 0;
  onProgress(0);
  const textures = await Promise.all(entries.map(async ([key, original]) => {
   const url = boardAssetUrl(original);
   if (!pending.has(url)) {
    const promise = Promise.resolve().then(() => load(url));
    pending.set(url, promise);
    promise.catch(() => { if (pending.get(url) === promise) pending.delete(url); });
   }
   const texture = await pending.get(url);
   onProgress(++completed / entries.length);
   return [key, texture];
  }));
  const result = Object.fromEntries(textures);
  result.entrySheets = settings?.spin === false ? null : Object.fromEntries(
   textures.filter(([key]) => key.startsWith('entry:')).map(([key, value]) => [key.slice(6), value]));
  result.storySheets = settings?.spin === false ? null : Object.fromEntries(
   textures.filter(([key]) => key.startsWith('story:')).map(([key, value]) => [key.slice(6), value]));
  return result;
 };
}

export const loadBoardAssets = createBoardAssetLoader(url => Assets.load(url));
export function prefetchBoardAssets() {
 // Prefetch failure must not become an unhandled rejection; mounting retries.
 return loadBoardAssets({lcd: true, spin: true, production: true}).catch(() => null);
}
