import test from 'node:test';import assert from 'node:assert/strict';
import {LCD_REEL_LAYOUT,isInsideLcdContent} from '../src/pixi/lcd-safe-layout.js';
const box=(x,y,w,h)=>{for(let px=x;px<=x+w;px+=1)for(let py=y;py<=y+h;py+=1)assert.ok(isInsideLcdContent(px,py),`outside LCD at ${px},${py}`);};
test('all active and five queued hold glyphs, travel and plate fit the stepped opening',()=>{
 const dx=LCD_REEL_LAYOUT.holdOffsetX;box(36+dx,124,119,14);
 for(const x of [45,69,87,105,123,141])box(x+dx-4,116,8,18);
 // This former active-slot corner is the observed lower-left aperture clipping.
 assert.equal(isInsideLcdContent(41,134),false);
});
test('normal and rush settled reels fit near aperture centroid, clear hold band and rush header',()=>{
 for(let i=0;i<3;i++){box(32+i*53,LCD_REEL_LAYOUT.normalTop,40,52);box(10+i*65+7.5,LCD_REEL_LAYOUT.rushTop+8.5,48,56);box(10+i*65+9,LCD_REEL_LAYOUT.rushTop+66,37,2);}
 assert.equal(LCD_REEL_LAYOUT.normalTop+25,LCD_REEL_LAYOUT.normalCenterY);
 assert.equal(LCD_REEL_LAYOUT.rushTop+37.5,LCD_REEL_LAYOUT.rushCenterY);
 assert.ok(Math.abs(LCD_REEL_LAYOUT.normalCenterY-62.7982259793)<.3);
 assert.ok(LCD_REEL_LAYOUT.rushTop>=28);
 assert.ok(LCD_REEL_LAYOUT.rushTop+75<116);
});
