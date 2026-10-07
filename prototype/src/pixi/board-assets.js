import {STORY_PREDICTION_ASSETS} from './story-prediction-assets.js';

export const BOARD_ART = Object.freeze({
 cabinetPortrait: '/assets/cabinet/upper-knight-portrait-v1.png',
 cabinetBackground: '/assets/cabinet/upper-night-landscape-v1.png',
 central: '/assets/central-start/central-start-v3.png',
 normal: '/assets/normal-pocket/normal-pocket-v1.png',
 tulipAtlas: '/assets/denchu/tulip-atlas-v2.png',
 frameTexture: '/machines/moonlit-pachinko-frame.png',
 lcdTexture: '/assets/lcd/moon-castle-v1.png',
 rushScene: '/assets/lcd/rush-eclipse-v1.png',
 reachAtlas: '/assets/lcd/long-reach/duel-poses-longhair-v4.png',
 reachMotionAtlas: '/assets/lcd/long-reach/duel-intermediates-longhair-v7.png',
 reachLandscape: '/assets/lcd/long-reach/moon-bridge-v1.png',
 cloudSky: '/assets/lcd/cloud-sky-v1.png',
 hairAtlas: '/assets/lcd/hair-tip-detail-v1.png',
 hairUnderlay: '/assets/lcd/character-static-v1.png'
});
export const ENTRY_ART = Object.freeze(Object.fromEntries(
 ['revival', 'moon', 'reflection', 'castle', 'slash', 'mechanism']
  .map(name => [name, `/assets/lcd/rush-entry-v2/${name}.png`])
));
export const BOARD_ART_URLS = Object.freeze([
 ...Object.values(BOARD_ART), ...Object.values(ENTRY_ART), ...Object.values(STORY_PREDICTION_ASSETS)
]);
// Build-time mapping uses content hashes; local previews continue using originals.
export const boardAssetUrl = url => import.meta.env?.BOARD_ASSET_URLS?.[url] ?? url;

export function selectedBoardArt({lcd = true, spin = true, production = true} = {}) {
 const entries = Object.entries(BOARD_ART).filter(([key]) =>
  ['central', 'normal', 'tulipAtlas'].includes(key)
  || (key === 'frameTexture' ? production
   : ['rushScene', 'reachAtlas', 'reachMotionAtlas', 'reachLandscape'].includes(key) ? spin : lcd));
 if (spin) {
  entries.push(...Object.entries(ENTRY_ART).map(([key, url]) => [`entry:${key}`, url]));
  entries.push(...Object.entries(STORY_PREDICTION_ASSETS).map(([key, url]) => [`story:${key}`, url]));
 }
 return entries;
}
