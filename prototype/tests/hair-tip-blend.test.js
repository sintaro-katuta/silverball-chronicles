import test from 'node:test';
import assert from 'node:assert/strict';
import {hairTipBlendAt} from '../src/pixi/hair-tip-idle.js';

test('moving hair fades into the fixed hair at the edge of its authored region',()=>{
 assert.equal(hairTipBlendAt(18),255);assert.equal(hairTipBlendAt(28),0);
 for(let x=19;x<=28;x++)assert.ok(hairTipBlendAt(x)<hairTipBlendAt(x-1));
});
