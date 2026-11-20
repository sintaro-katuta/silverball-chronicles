import {LCD_LAYOUT} from './lcd-layout.js';

// Cover the irregular LCD opening with a centred, undistorted 16:9 image.
// The opening mask trims the sides; no physical board geometry is changed.
const height=LCD_LAYOUT.height;
const width=height*16/9;
export const VIDEO_SCREEN=Object.freeze({x:LCD_LAYOUT.x+(LCD_LAYOUT.width-width)/2,y:LCD_LAYOUT.y,width,height});
export const VIDEO_IMAGE_TOP=(140-118.125)/2;
export const VIDEO_IMAGE_BOTTOM=VIDEO_IMAGE_TOP+118.125;
export const VIDEO_CONTENT_SCALE=VIDEO_SCREEN.width/210;
export const VIDEO_HOLD=Object.freeze({x:32.42,y:8.1,scale:.76});
export const LEGACY_HOLD=Object.freeze({x:23.825,y:5.3,scale:.85});
export const VIDEO_VICTORY_REEL_CENTER_Y=86;
// The central safe area remains visible inside both the rectangular video and
// the irregular cabinet aperture, including the lower sloped left edge.
export const VIDEO_SAFE_UI=Object.freeze({left:52,right:158,top:22,bottom:96});
export const VIDEO_RUSH_REELS=Object.freeze({left:57,step:33.5,top:48,scale:.72});
export const VIDEO_FULL_REELS=Object.freeze({left:57,step:33.5,top:54,scale:.72});
export function videoContentToBoard(x,y){
 return {x:VIDEO_SCREEN.x+x*VIDEO_CONTENT_SCALE,y:VIDEO_SCREEN.y+(y-VIDEO_IMAGE_TOP)*VIDEO_CONTENT_SCALE};
}
