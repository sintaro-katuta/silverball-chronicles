import {Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
// Shared ordinary silver-ball artwork: preserve the user-approved 28px sprite.
// Machine themes should supply surroundings, not redraw this ball.
export const SILVER_BALL_SIZE=28;
export function createSilverBallTexture(){
 const texture=Texture.from(pixelSurface(SILVER_BALL_SIZE,SILVER_BALL_SIZE,c=>{const d=painter(c);d.diamond(14,14,13,'#d3e8f4');d.rect(5,5,19,19,'#aec9dc');d.rect(3,9,23,11,'#aec9dc');d.rect(9,3,11,23,'#aec9dc');d.rect(7,5,12,10,'#dcecf5');d.rect(6,8,6,5,'#fff');d.rect(9,22,12,3,'#607e98');}));texture.source.scaleMode='nearest';return texture;
}
