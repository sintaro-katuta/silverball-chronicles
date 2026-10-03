import {LCD_LAYOUT,LCD_OPENING} from './lcd-layout.js';
// Existing 210×140 presentation coordinates, mapped into the stepped aperture.
export const LCD_CONTENT_SCALE=LCD_LAYOUT.width/210;
export const LCD_CONTENT_OFFSET_Y=(LCD_LAYOUT.height-140*LCD_CONTENT_SCALE)/2;
export const LCD_CONTENT_OPENING=Object.freeze(LCD_OPENING.map(([x,y])=>Object.freeze([(x-LCD_LAYOUT.x)/LCD_CONTENT_SCALE,(y-LCD_LAYOUT.y-LCD_CONTENT_OFFSET_Y)/LCD_CONTENT_SCALE])));
export const LCD_REEL_LAYOUT=Object.freeze({normalCenterY:63,rushCenterY:65.5,normalTop:38,rushTop:28,holdOffsetX:22});
export function isInsideLcdContent(x,y){
 let inside=false;const p=LCD_CONTENT_OPENING;
 for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>y)!==(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])inside=!inside;
 return inside;
}
