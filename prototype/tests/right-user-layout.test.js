import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {installSourceGuideMechanics} from '../src/pixi/source-guide-mechanics.js';
import {RIGHT_USER_LAYOUT_LINES} from '../src/pixi/source-right-user-layout-data.js';
import {sourceBoardSurfaces} from '../src/pixi/source-board-surfaces.js';
const make=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;
test('every source point from the user file is adopted without snapping or invented joins',()=>{
 const file=JSON.parse(readFileSync(new URL('../reference-review/s8-right-user-layout-20261026/user-layout.json',import.meta.url))),p=make();
 assert.equal(p.sourceGuidePaths.length,29);
 for(const line of file.lines){const actual=p.sourceGuidePaths.find(q=>q.id===line.id);assert.deepEqual(actual.points,line.points,line.name);}
 for(const line of RIGHT_USER_LAYOUT_LINES){
  const path=p.sourceGuidePaths.find(q=>q.id===line.id),contacts=p.colliders.filter(c=>c.sourceGuideId===line.id);
  assert.equal(contacts.length,line.points.length-1,line.name);
  contacts.forEach((c,i)=>{assert.deepEqual(c.a,path.worldPoints[i]);assert.deepEqual(c.b,path.worldPoints[i+1]);});
 }
 const diamond=RIGHT_USER_LAYOUT_LINES.find(q=>q.name==='右下ひし形');
 assert.deepEqual(sourceBoardSurfaces(p).deflector,diamond.points);
 assert.ok(!p.colliders.some(c=>c.role.startsWith('right-channel-7-')));
});
test('right front edits preserve the accepted left rear stage, pins, prizes, launch and other contacts',()=>{
 const p=make(),old=createBoardFlow({lcd:true,...productionBoardFlowOptions(),guideMechanicsProfile:'legacy'}).flow.physics;
 installSourceGuideMechanics(old,{userRightLayout:false});
 for(const key of ['sourceStage','pins','mechanisms','ballRadius','launchSpeedOffset','sourceSlopeGuide','nonReturnValve'])assert.deepEqual(p[key],old[key],key);
 assert.deepEqual(p.pockets.filter(q=>!['bonus','rush'].includes(q.kind)),old.pockets.filter(q=>!['bonus','rush'].includes(q.kind)));
 const changed=new Set(RIGHT_USER_LAYOUT_LINES.map(q=>q.id)),untouched=c=>!c.denchuShelf&&c.role!=='source-fuzu-rear-chute'&&!changed.has(c.sourceGuideId)&&!c.role.startsWith('right-channel-7-');
 assert.deepEqual(p.colliders.filter(untouched),old.colliders.filter(untouched));
});
