import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readSlump,writeSlump,slumpMarkup,SLUMP_KEY} from '../src/ui/floor-slump.js';
test('completed sessions are stored independently per machine and display actual values',async()=>{
 const map=new Map(),prefs={get:async({key})=>({value:map.get(key)}),set:async({key,value})=>map.set(key,value)};
 assert.equal(await readSlump(prefs,'one'),null);
 const game={balanceHistory:[{time:0,value:0},{time:10,value:-50},{time:20,value:90}],time:21,stock:470,initial:400};
 await writeSlump(prefs,'one',game);
 assert.equal(await readSlump(prefs,'two'),null);
 assert.match(slumpMarkup(await readSlump(prefs,'one')),/\+70/);
 assert.match(slumpMarkup(await readSlump(prefs,'one')),/L/);
 await writeSlump(prefs,'two',{...game,stock:300});
 assert.equal((await readSlump(prefs,'one')).points.at(-1).value,70);
 assert.equal((await readSlump(prefs,'two')).points.at(-1).value,-100);
 map.set(SLUMP_KEY,'bad json');assert.equal(await readSlump(prefs,'one'),null);
 assert.match(slumpMarkup(null),/まだ遊技データがありません/);
});
