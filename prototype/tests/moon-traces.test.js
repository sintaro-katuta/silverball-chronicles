import test from 'node:test';
import assert from 'node:assert/strict';
import {mountMoonTraces} from '../src/legacy/moon-traces.js';

function fixture() {
 const context = new Proxy({}, {get: () => () => {}});
 const element = () => ({dataset: {}, children: [], hidden: false, setAttribute() {}, append(x) {this.children.push(x);},
  getBoundingClientRect() {return {left: 0, top: 0, width: 100, height: 100};},
  getContext: () => context, remove() {}});
 const board = element(), lcd = element(), holds = element();
 holds.children = Array.from({length: 5}, element);
 board.ownerDocument = {createElement: element}; lcd.querySelector = () => holds;
 const controller = mountMoonTraces(board, lcd, {pockets: [{kind: 'start', x: 20, y: 80}]},
  {width: 100, height: 100, boardOffset: {x: 0, y: 0}});
 const game = {time: 0, phase: 'playing', acceptedDraws: [], spinActive: false};
 return {controller, game, badge: lcd.children[0]};
}
const draw = id => ({id, origin: {kind: 'start', mark: 'plain'}});
test('only a previously visible hold emits a consume trace, including the first spin', () => {
 const {controller: c, game: g} = fixture();
 g.acceptedDraws = [draw(1)]; c.update(g);
 g.activeDraw = g.acceptedDraws.shift(); g.spinActive = true; c.update(g);
 assert.deepEqual(c.diagnostics().segments, [{id: 1, kind: 'consume'}]);
 g.time = 2; g.activeDraw = draw(2); c.update(g);
 assert.deepEqual(c.diagnostics().segments, []); // Immediate entry is not a held entry.
});
test('demo does not inherit a stale active draw, and result clears frozen trails', () => {
 const {controller: c, game: g, badge} = fixture();
 g.activeDraw = draw(42);
 g.presentation = {id: 1, drawId: null, demo: true, origin: {kind: 'debug'}};
 c.update(g); assert.equal(badge.dataset.drawId, ''); assert.equal(c.diagnostics().current, null);
 g.presentation = null; c.update(g); assert.equal(badge.hidden, true);
 c.receive({type: 'drawQueued', drawId: 43, origin: {kind: 'start'}}, g);
 assert.equal(c.diagnostics().active, 1);
 g.phase = 'result'; c.update(g); assert.equal(c.diagnostics().active, 0);
});
test('trace age freezes with game time and a new game clears all prior identities', () => {
 const {controller: c, game: g} = fixture();
 g.acceptedDraws = [draw(1)]; c.update(g);
 c.receive({type: 'drawQueued', drawId: 1, origin: {kind: 'start'}}, g);
 g.phase = 'paused'; c.update(g); c.update(g);
 assert.equal(c.diagnostics().active, 1);
 c.update({...g, acceptedDraws: []});
 assert.equal(c.diagnostics().active, 0); assert.equal(c.diagnostics().current, null);
});
