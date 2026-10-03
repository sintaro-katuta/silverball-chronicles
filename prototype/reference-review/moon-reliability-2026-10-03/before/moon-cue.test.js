import test from 'node:test';import assert from 'node:assert/strict';
import {MOON_CUES,MOON_EXPECTATIONS,createMoonCueController} from '../src/pixi/moon-cue.js';
test('moon cue ordering prioritizes color, then phase, and probabilities remain unset',()=>{
 assert.equal(MOON_CUES.length,12);assert.ok(MOON_CUES.find(x=>x.phase==='crescent'&&x.color==='red').rank>MOON_CUES.find(x=>x.phase==='full'&&x.color==='blue').rank);
 assert.equal(MOON_EXPECTATIONS,null);
});
test('moon keeps the same cue through a draw; sword strike makes it red and idle resets',()=>{
 const moon=createMoonCueController(),g={time:1,spinResult:{drawId:2,moonCue:{phase:'half',color:'green'}}};
 assert.equal(moon.render(g,{phase:'rest'}).color,'green');
 delete g.spinResult;g.presentation={drawId:2};assert.equal(moon.render(g,{phase:'rest'}).phase,'half');
 assert.equal(moon.render(g,{phase:'slash'}).color,'red');
 assert.equal(moon.render({time:5},{phase:'rest'}).color,'none');
 assert.equal(moon.render({time:6,spinResult:{drawId:3}},{phase:'rest'}).phase,'crescent');
});
