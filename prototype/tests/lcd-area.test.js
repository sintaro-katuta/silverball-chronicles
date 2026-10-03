import test from 'node:test';import assert from 'node:assert/strict';
import {LCD_OPENING,overlapsLcd} from '../src/pixi/lcd-layout.js';
import {sourcePoint,SCREEN_SOURCE} from '../src/pixi/source-layout.js';
test('source layout preserves aspect ratio and every stepped LCD opening corner',()=>{
 assert.equal(LCD_OPENING.length,SCREEN_SOURCE.length);
 for(let i=1;i<SCREEN_SOURCE.length;i++){const a=SCREEN_SOURCE[i-1],b=SCREEN_SOURCE[i],c=LCD_OPENING[i-1],d=LCD_OPENING[i];assert.ok(Math.abs(Math.hypot(d[0]-c[0],d[1]-c[1])/Math.hypot(b[0]-a[0],b[1]-a[1])-.5)<1e-10);}
});
test('lower left lane stays open while the centre of the source screen is protected',()=>{
 const point=p=>{const [x,y]=sourcePoint(p);return {x,y,r:1.9};};
 assert.equal(overlapsLcd(point([300,830])),false);assert.equal(overlapsLcd(point([440,550])),true);
});
