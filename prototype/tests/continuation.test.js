import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/domain/game.js';
import {durationFor} from '../src/presentation/cinematic.js';
const ball=()=>({gold:false,large:false,hits:0});
const setup=(roll=.99)=>{const g=new Game(freshProfile(),0,()=>roll);g.rules.targetBase=1e8;return g;};
function finishBonus(g){for(let n=0;n<20&&g.jackpot;n++){const j=g.jackpot;j.gap=0;for(let i=j.count;i<10;i++)g.hit(ball(),'bonus',5);g.tick(.01);}assert.equal(g.jackpot,null);}

test('4R challenge is fixed at bonus start and pays 600 on either success or failure',()=>{
 for(const win of [false,true]){const g=setup(win?.1:.9);g.pendingGrade=4;g.startJackpot();assert.equal(g.jackpot.entryEligible,win);assert.equal(g.jackpot.entryRevealed,false);g.rng=()=>win?.99:0;finishBonus(g);assert.equal(g.total,600);assert.equal(!!g.rush,win);assert.equal(g.lastBonus.entryEligible,win);if(win){assert.equal(g.rush.total,600);assert.equal(g.rush.remaining,100);assert.equal(g.rush.chain,1);}}
});

test('6R and 10R initial wins enter RUSH, retain fixed grade and reveal only already selected rounds',()=>{
 for(const rounds of [6,10]){const g=setup(.9);g.pendingGrade=rounds;g.startJackpot();assert.ok(g.jackpot.entryEligible);assert.ok(g.jackpot.entryRevealed);assert.equal(g.jackpot.displayRounds,4);g.jackpot.round=4;g.jackpot.count=7;g.tick(.01);assert.equal(g.jackpot.displayRounds,6);assert.equal(g.jackpot.rounds,rounds);if(rounds===10){g.jackpot.round=6;g.jackpot.count=7;g.tick(.01);assert.equal(g.jackpot.displayRounds,10);}assert.equal(g.jackpots,1);assert.equal(g.events.filter(e=>e.type==='roundsAdded').length,0);finishBonus(g);assert.equal(g.rush.remaining,100);}
});

test('challenge, bonus and RUSH clocks freeze through pause and stage choice',()=>{
 const g=setup(.1);g.pendingGrade=4;g.startJackpot();g.jackpot.round=4;g.jackpot.count=7;g.tick(.01);assert.equal(g.jackpot.challenge.win,null);assert.ok(g.fire());g.tick(.5);g.pause();g.tick(99);assert.equal(g.jackpot.challenge.time,.5);g.resume();g.award(g.target);g.checkStage();const before=structuredClone(g.jackpot);g.tick(99);assert.deepEqual(g.jackpot,before);g.selectSkill(g.choices[0].id);g.tick(1.2);assert.equal(g.jackpot.challenge.win,true);finishBonus(g);g.enqueueDraw(3,'rush','rush');g.tick(.1);const state={remaining:g.rush.remaining,time:g.drawTimer,holds:g.queue};g.pause();g.tick(99);assert.deepEqual({remaining:g.rush.remaining,time:g.drawTimer,holds:g.queue},state);
});

test('RUSH consumes exactly 100 accepted spins and retains normal holds until return',()=>{
 const g=setup();g.phase='paused';g.enqueueDraw(3,'start','normal');g.resume();const held=[...g.normalHolds];g.startRush();let accepted=0;for(let n=0;n<1000&&g.rush;n++){accepted+=g.enqueueDraw(20,'rush','rush');g.tick(1);}assert.equal(g.rush,null);assert.equal(accepted,100);assert.equal(g.draws,100);assert.equal(g.lastRush.consumed,100);assert.equal(g.lastRush.remaining,0);assert.equal(g.rushHolds.length,0);assert.deepEqual(g.normalHolds,held);assert.equal(g.queue,3);assert.equal(g.events.filter(e=>e.type==='rushEnd').length,1);
});

test('a winning final RUSH spin resolves its presentation before resetting, without extra residual draws',()=>{
 const g=setup(.001);g.startRush();g.rush.remaining=1;assert.equal(g.enqueueDraw(20,'rush','rush'),1);assert.equal(g.canAcceptRushDraw,false);g.tick(1);assert.equal(g.rush.remaining,0);assert.ok(g.presentation.win);assert.equal(g.jackpot,null);assert.equal(g.enqueueDraw(1,'rush','rush'),0);assert.equal(g.events.some(e=>e.type==='rushEnd'),false);g.tick(durationFor(g.presentation.pattern)*g.presentation.rate);assert.equal(g.jackpot.fromRush,true);assert.equal(g.rush.chain,2);finishBonus(g);assert.equal(g.rush.remaining,100);assert.equal(g.draws,1);assert.equal(g.rush.consumed,1);assert.equal(g.jackpots,1);
});

test('RUSH draws target 66% within 100 and 30/50/20 payouts, never normal rescue or wind, with 1-ball start prize',()=>{
 for(const [roll,rounds] of [[.1,5],[.3,10],[.8,20]]){const g=setup(roll);g.startRush();g.rules.pityLimit=1;g.skills.wind=5;g.misses=100;g.enqueueDraw();assert.ok(Math.abs(1-(1-1/g.activeDraw.odds)**100-.66)<1e-12);assert.equal(g.activeDraw.boost,0);assert.equal(g.activeDraw.grade,rounds);assert.equal(g.spinResult.pity,false);g.tick(1);assert.equal(g.pityCount,1);assert.equal(g.lastResolvedDraw.win,false);}
 const p=freshProfile();p.upgrades.start=2;const g=new Game(p,0,()=>.99);g.rules.targetBase=1e8;g.startRush();for(let n=0;n<10;n++)g.hit(ball(),'rush',6);assert.equal(g.ledger.basePrize,10);assert.equal(g.total,11);assert.equal(g.rush.total,11);assert.equal(g.drawSerial,6);
});

test('RUSH retained holds survive bonus/reset without rerolling or consuming spins during payout',()=>{
 const g=setup(.001);g.startRush();g.enqueueDraw(6,'rush','rush');const holds=[...g.rushHolds];g.tick(1);g.tick(durationFor(g.presentation.pattern)*g.presentation.rate);const remaining=g.rush.remaining;g.rng=()=>.99;g.tick(1);assert.equal(g.rush.remaining,remaining);assert.deepEqual(g.rushHolds,holds);finishBonus(g);assert.equal(g.rush.remaining,100);assert.deepEqual(g.rushHolds,holds);g.tick(1);assert.equal(g.lastResolvedDraw.id,holds[0].id);assert.equal(g.lastResolvedDraw.win,true);assert.equal(g.rush.remaining,99);
});


test('full base payouts remain 600/900/1500, and a RUSH chain total includes its entry bonus once',()=>{
 for(const rounds of [4,6,10]){const g=setup(.1);g.pendingGrade=rounds;g.startJackpot();finishBonus(g);assert.equal(g.total,rounds*150);assert.equal(g.rush.total,rounds*150);const before=g.total;g.pendingGrade=4;g.startJackpot();finishBonus(g);assert.equal(g.total,before+500);assert.equal(g.rush.total,before+500);assert.equal(g.rush.chain,2);assert.equal(g.rush.remaining,100);}
});

test('campaign completion during bonus or RUSH finishes immediately and cannot start another RUSH',()=>{
 for(const mode of ['bonus','rush']){const g=setup(.1);g.stage=10;if(mode==='bonus'){g.pendingGrade=6;g.startJackpot();g.setStock(g.target-1);g.hit(ball(),'bonus',5);}else{g.startRush();g.setStock(g.target-1);g.hit(ball(),'rush',6);}assert.equal(g.phase,'result');assert.equal(g.result.reason,'clear');const before=structuredClone({rush:g.rush,jackpot:g.jackpot,draws:g.draws,events:g.events});g.tick(100);g.startRush();if(g.jackpot)g.finishBonus(g.jackpot);assert.deepEqual({rush:g.rush,jackpot:g.jackpot,draws:g.draws,events:g.events},before);}
});

test('normal entries made during RUSH retain normal odds and wait without consuming right-side budget',()=>{
 const g=setup();g.startRush();g.rush.remaining=2;g.hit(ball(),'start',4);const record=g.normalHolds[0];assert.equal(record.odds,199);assert.equal(record.mode,'normal');assert.equal(g.queue,0);assert.equal(g.rush.remaining,2);assert.equal(g.enqueueDraw(10,'rush','rush'),2);while(g.rush)g.tick(1);assert.equal(g.draws,2);assert.equal(g.normalHolds[0],record);g.tick(1);g.tick(4);assert.equal(g.lastResolvedDraw.id,record.id);assert.equal(g.lastResolvedDraw.mode,'normal');
});
