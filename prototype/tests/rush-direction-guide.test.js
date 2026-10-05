import test from 'node:test';
import assert from 'node:assert/strict';
import {createRushDirectionGuide} from '../src/pixi/rush-direction-guide.js';

test('RUSH entry reannounces right after the bonus and its title, once',()=>{
 const guide=createRushDirectionGuide(),g={rush:null};
 assert.equal(guide.update(g),null);
 g.rush={remaining:130};g.jackpot={};assert.equal(guide.update(g),null);
 g.entryPrelude={};g.jackpot=null;assert.equal(guide.update(g),null);
 delete g.entryPrelude;g.entryGuideAt=100;g.entryTitleOffset=2.4;
 assert.deepEqual(guide.update(g),{direction:'right',delay:0});
 assert.equal(guide.update(g),null);
 g.jackpot={};assert.equal(guide.update(g),null);g.jackpot=null;
 assert.equal(guide.update(g),null,'another RUSH win does not repeat initial entry');
 g.rush=null;guide.update(g);g.rush={remaining:130};g.entryGuideAt=200;g.entryTitleOffset=0;
 assert.deepEqual(guide.update(g),{direction:'right',delay:2.4});
});

test('starting directly in RUSH announces right after the title',()=>{
 const guide=createRushDirectionGuide();
 assert.deepEqual(guide.update({rush:{remaining:130}}),{direction:'right',delay:2.4});
 assert.equal(guide.update({rush:{remaining:130}}),null);
});
