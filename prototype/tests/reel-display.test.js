import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProfile} from '../src/game.js';
import {mountReelDisplay,stripOffset,centeredDigit} from '../src/reel-display.js';

// Small DOM surface keeps the renderer test independent of an extra DOM package.
class Element{
 constructor(tag,doc){this.tagName=tag;this.ownerDocument=doc;this.children=[];this.dataset={};this.attributes={};this.styles={};this.style={setProperty:(key,value)=>this.styles[key]=value};this.classes=new Set();this.classList={add:value=>this.classes.add(value),remove:value=>this.classes.delete(value),toggle:(value,on)=>on?this.classes.add(value):this.classes.delete(value)};}
 set className(value){this.classes=new Set(value.split(' '));}
 get className(){return [...this.classes].join(' ');}
 append(child){this.children.push(child);child.parent=this;}
 replaceChildren(...children){this.children=[];for(const child of children)this.append(child);}
 setAttribute(key,value){this.attributes[key]=value;}
 getAttribute(key){return this.attributes[key]??null;}
 remove(){this.parent.children=this.parent.children.filter(child=>child!==this);}
}
function mounted(){const doc={createElement:tag=>new Element(tag,doc)},host=new Element('div',doc),display=mountReelDisplay(host);return {host,display};}
const offsets=host=>host.children.map(window=>window.children[0].styles['--reel-offset']);

test('strip wraps to identical repeated digits with a buffer above and below',()=>{
 assert.equal(stripOffset(0),stripOffset(9));assert.equal(stripOffset(-1),stripOffset(8));assert.equal(centeredDigit(-1),9);assert.equal(centeredDigit(9),1);
 const {host}=mounted();assert.equal(host.children.length,3);
 for(const window of host.children){assert.equal(window.tagName,'span');const strip=window.children[0];assert.equal(strip.children.length,27);assert.deepEqual(strip.children.slice(9,18).map(symbol=>symbol.textContent),['1','2','3','4','5','6','7','8','9']);}
});

test('fractional frame movement scrolls the existing strip without recreating symbols',()=>{
 const {host,display}=mounted(),g=new Game(freshProfile(),0,()=>.8);g.enqueueDraw();display.update(g);const windows=[...host.children],symbols=windows[0].children[0].children;const before=offsets(host);g.tick(1/120);display.update(g);const after=offsets(host);
 assert.notDeepEqual(after,before);const displacement=Math.abs(Number(after[0])-Number(before[0]));assert.ok(Math.min(displacement,9-displacement)<.1);
 assert.equal(host.children[0],windows[0]);assert.equal(host.children[0].children[0].children,symbols);
 g.pause();const paused=offsets(host);g.tick(99);display.update(g);assert.deepEqual(offsets(host),paused);
});

test('left then middle then right land on their model results and stopped columns do not drift',()=>{
 const {host,display}=mounted(),g=new Game(freshProfile(),0,()=>.8);g.enqueueDraw();display.update(g);const target=[...g.spinResult.reels];g.tick(g.drawTempo+.01);display.update(g);
 assert.equal(host.children[0].dataset.phase,'stopped');assert.equal(host.children[0].dataset.value,String(target[0]));const left=offsets(host)[0];
 g.tick(g.reelStopGap);display.update(g);assert.equal(offsets(host)[0],left);assert.equal(host.children[1].dataset.value,String(target[1]));const middle=offsets(host)[1];
 g.tick(g.reelStopGap);display.update(g);assert.equal(offsets(host)[0],left);assert.equal(offsets(host)[1],middle);assert.deepEqual(host.children.map(window=>Number(window.dataset.value)),target);assert.ok(host.children.every(window=>window.dataset.phase==='stopped'));
});

test('reach locks matching left/middle while only the right strip continues, and disposal removes all columns',()=>{
 const {host,display}=mounted(),g=new Game(freshProfile(),0,()=>.001);g.enqueueDraw();display.update(g);g.tick(g.drawTempo+g.reelStopGap+.01);display.update(g);const before=offsets(host);assert.equal(host.children[0].dataset.value,'7');assert.equal(host.children[1].dataset.value,'7');g.tick(.04);display.update(g);assert.equal(offsets(host)[0],before[0]);assert.equal(offsets(host)[1],before[1]);assert.notEqual(offsets(host)[2],before[2]);display.dispose();assert.equal(host.children.length,0);display.update(g);assert.equal(host.children.length,0);
});
