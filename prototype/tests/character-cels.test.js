import test from 'node:test';import assert from 'node:assert/strict';
import {IDLE_EXPOSURES,IDLE_FPS,IDLE_TICKS,idleFrameAt} from '../src/pixi/character-idle.js';
test('complete character drawings advance together and loop',()=>{let t=0;for(let n=0;n<16;n++){assert.equal(idleFrameAt((t+.5)/IDLE_FPS),n);t+=IDLE_EXPOSURES[n];}assert.equal(idleFrameAt((IDLE_TICKS+.5)/IDLE_FPS),0);});
test('no long frozen cels are introduced',()=>{assert.ok(Math.max(...IDLE_EXPOSURES)/IDLE_FPS<.2);});
