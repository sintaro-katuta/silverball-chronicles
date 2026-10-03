import {Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
// Shared approved 14px brass pin; three broad shades on the common ball grid.
export function createPinTexture({highlight=false}={}){
 const texture=Texture.from(pixelSurface(14,14,c=>{const d=painter(c);d.diamond(7,7,6,'#705032');d.rect(3,3,9,9,'#b88d49');d.rect(2,5,11,5,'#b88d49');d.rect(5,2,5,11,'#b88d49');d.rect(4,3,6,5,'#f4d796');d.rect(3,5,3,3,'#f4d796');d.rect(5,11,5,2,'#705032');if(highlight)d.rect(4,3,4,3,'#fff1bf');}));texture.source.scaleMode='nearest';return texture;
}
