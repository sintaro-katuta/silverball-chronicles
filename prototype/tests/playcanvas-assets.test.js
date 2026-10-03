import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Physics} from '../src/physics.js';
import {SCENES,PATTERNS} from '../src/reach-scenes.js';
import {beatsFor} from '../src/cinematic.js';
const read=path=>readFileSync(new URL(path,import.meta.url));
const glb=path=>{const b=read(path);assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);return JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());};
test('all course models retain the live physical layout and required mechanism nodes',()=>{
 const boards=JSON.parse(read('../src/playcanvas/board-metadata.json'));
 for(let course=0;course<3;course++){
  const physics=new Physics(course),model=glb(`../public/models/course-${course}.glb`),names=new Set(model.nodes.map(n=>n.name));
  for(const key of ['pins','colliders','pockets'])assert.deepEqual(boards[course][key],physics[key],`course ${course} ${key}: regenerate GLB after geometry changes`);
  for(const name of ['right-unit','receiving-ports','gate','gatePanel','gateRib','attackerGlow','chuckerScoop','chuckerCover','cinematic-crest'])assert.ok(names.has(name),name);
  physics.mechanisms.forEach((_,i)=>assert.ok(names.has(`windmill-${i}`)));
  for(const image of model.images)assert.equal(typeof image.bufferView,'number','model textures must be embedded for offline play');
 }
});
test('baked glyphs cover every cinematic label and remain individually addressable',()=>{
 const model=glb('../public/models/title-glyphs.glb'),names=new Set(model.nodes.map(n=>n.name)),metrics=JSON.parse(read('../src/playcanvas/title-metrics.json'));
 const labels=['リーチ','大当り',...SCENES.map(s=>`VS ${s.enemy}`),...PATTERNS.flatMap(p=>beatsFor(p.id).map(b=>b.title))];
 for(const char of new Set(labels.join(''))){assert.ok(metrics[char],char);if(char.trim())assert.ok(names.has(metrics[char].name),char);}
});
