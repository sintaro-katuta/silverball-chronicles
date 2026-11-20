import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {BOARD_ART} from '../src/pixi/board-assets.js';

async function image(url){
 const {data,info}=await sharp(fileURLToPath(new URL(`../public${url}`,import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const alpha=(x,y)=>data[(y*info.width+x)*4+3];
 return {info,alpha,data};
}

test('approved pocket art retains its pixel grid, transparency, and open U silhouette',async()=>{
 const central=await image(BOARD_ART.central),ordinary=await image(BOARD_ART.normal);
 assert.deepEqual([central.info.width,central.info.height],[25,25]);
 assert.deepEqual([ordinary.info.width,ordinary.info.height],[12,12]);
 for(const asset of [central,ordinary]){
  for(let i=3;i<asset.data.length;i+=4)assert.ok(asset.data[i]===0||asset.data[i]===255,'pixels must have binary alpha');
  assert.equal(asset.alpha(0,0),0);
 }
 assert.equal(ordinary.alpha(0,1),255);
 assert.equal(ordinary.alpha(11,1),255);
 assert.equal(ordinary.alpha(5,1),0);
 assert.equal(ordinary.alpha(5,8),255);
 assert.equal(central.alpha(12,12),255);
 assert.equal(central.alpha(0,12),0);
});
