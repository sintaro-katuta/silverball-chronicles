import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {protectsMoonHighlight,isCloudSkyPixel} from '../src/pixi/cloud-idle.js';

test('bright inner-edge pixels from the normal-screen moon remain in front of moving clouds',async()=>{
 const image=await sharp(fileURLToPath(new URL('../public/assets/lcd/moon-castle-v1.png',import.meta.url)))
  .resize(210,140,{kernel:'nearest'}).removeAlpha().raw().toBuffer();
 for(const [x,y] of [[171,12],[174,15],[177,25],[176,29]]){
  const i=(y*210+x)*3;
  assert.ok(protectsMoonHighlight(x,y,...image.subarray(i,i+3)),`moon pixel ${x},${y}`);
 }
 assert.equal(protectsMoonHighlight(100,20,255,255,255),false,'unrelated bright pixels remain cloud-eligible');
 assert.equal(protectsMoonHighlight(177,25,10,30,100),false,'dark gaps inside the crescent stay available to clouds');
});


test('separated sky reaches behind the hair while preserving land and moon',()=>{
 assert.equal(isCloudSkyPixel(12,40,false),false,'legacy silhouette blocks the old character area');
 assert.equal(isCloudSkyPixel(12,40,true),true,'clouds can move behind separated hair');
 assert.equal(isCloudSkyPixel(12,80,true),false,'foreground land is not covered');
 assert.equal(isCloudSkyPixel(180,22,true),false,'moon remains in front of clouds');
});
