import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Game, freshProfile} from '../src/domain/game.js';
import {moonBuildStyle, moonOrigin} from '../src/domain/moon-state.js';

const ball = (x = 200) => ({x, y: 500, gold: false, large: false, hits: 0});
test('FIFO keeps the entry and build snapshot after skills change, through the reach', () => {
 const g = new Game(freshProfile(), 0, () => 0);
 g.stopTimer = 1; g.skills.twin = 2;
 g.hit(ball(170), 'start', 4);
 g.skills = {bank: 4};
 g.hit(ball(180), 'start', 4);
 const [first, second] = g.normalHolds;
 assert.equal(first.buildStyle, 'assault'); assert.equal(second.buildStyle, 'counter');
 assert.equal(first.origin.x, 170); assert.equal(second.origin.x, 180);
 assert.ok(Object.isFrozen(first.origin));
 g.tick(2); g.tick(10);
 assert.equal(g.presentation.drawId, first.id);
 assert.deepEqual(g.presentation.origin, first.origin);
 assert.equal(g.presentation.buildStyle, 'assault');
 assert.equal(g.normalHolds[0].id, second.id);
});

test('normal and RUSH entry provenance stay separated and rejected holds emit nothing', () => {
 const g = new Game(freshProfile(), 0, () => .5);
 g.stopTimer = 1; g.hit(ball(170), 'start', 4);
 const normal = g.normalHolds[0]; g.startRush(); g.rush.remaining = 2;
 for (let i = 0; i < 4; i++) g.hit(ball(310), 'rush', 8);
 assert.equal(g.rushHolds.length, 2); assert.equal(g.normalHolds[0], normal);
 assert.ok(g.rushHolds.every(d => d.origin.kind === 'rush' && d.origin.pocketId === 8));
 assert.equal(g.events.filter(e => e.type === 'drawQueued').length, 3);
 g.tick(2); g.tick(.01);
 assert.equal(g.activeDraw.origin.kind, 'rush');
 assert.equal(g.normalHolds[0].origin.kind, 'start');
});

test('double/back retain their real entry, opening/debug do not invent physical entries', () => {
 const g = new Game(freshProfile(), 0, () => 0);
 g.skills = {double: 1, back: 5}; g.stopTimer = 1;
 g.hit({...ball(), gold: true}, 'start', 4);
 assert.deepEqual(g.normalHolds.map(d => d.source), ['start', 'double-skill']);
 assert.deepEqual(g.normalHolds[0].origin, g.normalHolds[1].origin);
 g.normalCount = 11; g.hit(ball(100), 'normal', 1);
 assert.equal(g.normalHolds[2].source, 'back-skill');
 assert.equal(g.normalHolds[2].origin.kind, 'normal');
 g.enqueueDraw(1, 'opening-skill');
 assert.deepEqual(g.normalHolds[3].origin, {kind: 'opening', mark: 'plain'});
 g.queue = 5; assert.equal(g.normalHolds[4].origin.kind, 'debug');
 g.practice = true; g.beginPresentation(false, true);
 assert.equal(g.presentation.drawId, null); assert.equal(g.presentation.origin.kind, 'debug');
});

test('immediate entries emit the same draw identity; snapshots sanitize missing inputs', () => {
 const g = new Game(freshProfile(), 0, () => .5);
 g.hit(ball(), 'start', 4);
 const event = g.events.find(e => e.type === 'drawQueued');
 assert.equal(event.immediate, true); assert.equal(event.drawId, g.activeDraw.id);
 assert.equal(event.origin, g.activeDraw.origin);
 assert.deepEqual(moonOrigin('start', 'normal', {x: Infinity, y: 1, mark: 'unknown'}), {kind: 'start', mark: 'plain'});
 assert.equal(moonBuildStyle({twin: 2, bank: 2}), 'balanced');
 assert.equal(moonBuildStyle({pocket: 1}), 'fortify');
});

test('build direction overrides are restricted to practice presentation demos', () => {
 const g = new Game(freshProfile(), 0, () => .5);
 g.practice = true;
 g.beginPresentation(false, true, {buildStyle: 'counter'});
 assert.equal(g.presentation.buildStyle, 'counter');
 assert.equal(g.presentation.drawId, null);
 g.presentation = null;
 g.beginPresentation(false, false, {buildStyle: 'assault'});
 assert.equal(g.presentation.buildStyle, 'balanced');
});

// Regression baseline updated for the user-approved 2026-09-30 RUSH rules:
// 66% over 100 spins and 500/1500/3000 conditional payouts. Individual
// probability, payout and admission invariants are checked in rush-prize.test.js.
// This trace also covers non-presentation events, RNG consumption and stops.
export function ruleTrace(GameClass = Game) {
 let seed = 9127, calls = 0;
 const rng = () => {calls++; seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296;};
 const g = new GameClass(freshProfile(), 0, rng), trace = [];
 g.rules.targetBase = 1e10; g.rules.pityLimit = 7;
 g.skills = {double: 3, back: 5, twin: 2, bank: 2, wind: 3};
 for (let i = 0; i < 600; i++) {
  if (i === 220 && !g.rush) g.startRush();
  const kind = g.jackpot ? 'bonus' : g.rush ? 'rush' : i % 3 ? 'start' : 'normal';
  g.hit(ball(140 + i % 20), kind, kind === 'rush' ? 8 : 4);
  g.tick(.5);
  trace.push({calls, stock: g.stock, total: g.total, draws: g.draws, reels: g.stoppedReels,
   normal: g.normalHolds.map(d => [d.id, d.source, d.winRoll, d.gradeRoll]),
   rush: g.rush && {...g.rush}, bonus: g.jackpot && {...g.jackpot},
   events: g.events.filter(e => e.type !== 'drawQueued')});
  g.events = [];
 }
 return createHash('sha256').update(JSON.stringify(trace)).digest('hex');
}
test('presentation provenance preserves the approved lottery/payout/RUSH regression trace', () => {
 assert.equal(ruleTrace(), '373eb73d0a373978efeadbf27f46484107baa2b7e0c23a3be201052a0067364a');
});
