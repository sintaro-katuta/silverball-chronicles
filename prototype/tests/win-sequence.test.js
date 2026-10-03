import test from 'node:test';import assert from 'node:assert/strict';import {WIN_SEQUENCE,mechanismTime,reachSeconds} from '../src/pixi/win-sequence.js';
test('ornament covers and retracts during winning reach, before center stop, never after win',()=>{
 for(const fromRush of [false,true]){const s=WIN_SEQUENCE[fromRush?'rush':'normal'];assert.ok(s.mechanismAt+s.mechanismSeconds<s.reachSeconds);const g={rush:fromRush?{}:null,presentation:{basicReach:true,win:true,time:1}};assert.equal(mechanismTime(g),.55);assert.equal(reachSeconds(g.presentation,fromRush),2.5);g.presentation=null;g.previewWinAt=0;g.time=1;assert.equal(mechanismTime(g),-1);}
 assert.equal(mechanismTime({presentation:{basicReach:true,win:false,time:1}}),-1);
 assert.equal(reachSeconds({win:false},true),.45);assert.equal(reachSeconds({win:false},false),2);
});
