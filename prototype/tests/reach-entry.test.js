import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile,COURSES} from '../src/domain/game.js';
import {timeline,reachBeat,reachColor,RED_RATE,REACH_DURATION,durationFor} from '../src/presentation/cinematic.js';
import {reelState} from '../src/domain/reels.js';
test('reach announces before battle, holding matching left and middle digits through the battle',()=>{
 const g=new Game(freshProfile(),0,()=>.5);g.beginPresentation(false);
 assert.equal(reachBeat(timeline(g)).title,'リーチ');
 for(const dt of [.1,.4,.9,.7,4]){g.tick(dt);const r=reelState(g);assert.equal(r.numbers[0],r.numbers[1]);assert.equal(r.spinning,true);}
 assert.notEqual(reachBeat(timeline(g)).id,'reach');
 g.tick(durationFor(g.presentation.pattern));assert.equal(g.stoppedReels[0],g.stoppedReels[1]);assert.notEqual(g.stoppedReels[2],g.stoppedReels[0]);
});
test('red has higher conditional win expectation on every course without changing draw odds',()=>{
 assert.equal(reachColor(true,()=>.5),'red');assert.equal(reachColor(false,()=>.5),'normal');
 for(const course of COURSES){const p=1/course.odds,loss=(1-p)*.055;
 const red=p*RED_RATE.win/(p*RED_RATE.win+loss*RED_RATE.loss);
 const normal=p*(1-RED_RATE.win)/(p*(1-RED_RATE.win)+loss*(1-RED_RATE.loss));
 assert.ok(red>normal);assert.ok(red<1);assert.ok(normal>0);}
});
test('both colors can win and lose; overrides are practice only and pause freezes the announcement',()=>{
 for(const win of [true,false])for(const color of ['normal','red']){const g=new Game(freshProfile(),0,()=>.5);g.practice=true;g.beginPresentation(win,true,{color,pattern:win?'victory':'defeat'});assert.equal(g.presentation.reachColor,color);g.tick(.5);g.pause();g.tick(10);assert.equal(g.presentation.time,.5);g.resume();g.tick(REACH_DURATION-.5);assert.equal(reachBeat(timeline(g)).id,'warning');g.tick(durationFor(g.presentation.pattern));assert.equal(g.jackpots,win?1:0);}
 const g=new Game(freshProfile(),0,()=>.5);g.beginPresentation(false,false,{color:'red'});assert.equal(g.presentation.reachColor,'normal');
});
