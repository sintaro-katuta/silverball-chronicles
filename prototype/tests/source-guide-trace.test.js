import {readFileSync} from 'node:fs';
import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {sourcePoint} from '../src/pixi/source-layout.js';
import {paintSourceGuideTrace,installSourceGuideTrace} from '../src/pixi/source-guide-trace.js';
const board=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;
const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
// Independently observed neutral-stroke centres in the source JPEG. In particular,
// the old estimates miss x135 at y403, x109 at y550, x785 at y400, and x794 at y800.
const observations=[
 ['left-inlet',135,403],['left-inlet',112.5,500],['left-inlet',109,550],
 ['left-title-edge',143.5,460],['left-title-edge',135.5,520],['left-title-edge',175,610],
 ['left-return',211,670],['left-return',196,691],['left-return',188,680],
 ['apron-outer',183.5,700],['apron-outer',300,795],['apron-outer',440,837],
 ['unit-right-step',750,613],['unit-right-step',684,640],['unit-right-step',665.5,700],
 ['right-channel-inner',756,400],['right-channel-inner',788,520],['right-channel-inner',775,600],
 ['right-channel-outer',785,400],['right-channel-outer',811,500],['right-channel-outer',797,600],
 ['right-attacker-approach',716,640],['right-return-wall',771,700],['right-return-inner',749.5,760],
 ['right-outside-wall',794,800],['right-lower-guide',651.5,830],['electric-left-moulding',535,860],
];
test('unchanged guides retain earlier image observations; user edits take precedence over those estimates',()=>{
 const changed=new Set(JSON.parse(readFileSync(new URL('../reference-review/s8-user-guides-20261024/changes.json',import.meta.url))).changed.map(p=>p.id));
 const latest=JSON.parse(readFileSync(new URL('../reference-review/s8-right-user-layout-20261026/diff.json',import.meta.url)));for(const c of latest.changed)changed.add(c.id);
 const p=board();for(const[id,sx,sy]of observations.filter(([id])=>!changed.has(id))){const[x,y]=sourcePoint([sx,sy]),segments=p.colliders.filter(c=>c.sourceGuideId===id);assert.ok(segments.length,`missing ${id}`);assert.ok(Math.min(...segments.map(c=>distance({x,y},c.a,c.b)))<=1,`${id}: source ${sx},${sy}`);}
});
test('original settings, pockets, mechanisms, pins and non-guide contacts are unchanged by tracing',()=>{
 const options=productionBoardFlowOptions(),before=createBoardFlow({lcd:true,...options,leftInletRoute:'legacy'}).flow.physics,after=createBoardFlow({lcd:true,...options,leftInletRoute:'legacy'}).flow.physics;
 // Test tracing itself; production separately installs the rear launch-depth fix.
 installSourceGuideTrace(after);
 for(const key of ['pins','pockets','mechanisms','ballRadius','launchSpeedOffset','gravity','outlet','gate'])assert.deepEqual(after[key],before[key],key);
 const untouched=c=>c.role.startsWith('launch-')||c.role==='right-channel-5-1'||c.role.startsWith('right-channel-7-')||c.role.endsWith('-rim');
 assert.deepEqual(after.colliders.filter(untouched),before.colliders.filter(untouched));
 assert.equal(after.colliders.some(c=>!c.sourceGuideId&&(c.role==='left-inlet-guide'||c.role==='right-inner-lower'||/^right-channel-[0-46]-/.test(c.role)||/^lcd-boundary-(?:[89]|1\d|2\d)$/.test(c.role))),false);
});
test('rendered guide centrelines and contacts use the same vertices; moulding seams never become walls',()=>{
 const p=board(),lines=[];paintSourceGuideTrace({line(...a){lines.push(a);}},q=>q,p);
 for(const path of p.sourceGuidePaths){const contacts=p.colliders.filter(c=>c.sourceGuideId===path.id);assert.equal(contacts.length,path.contact?path.worldPoints.length-1:0,path.id);
  for(let i=1;i<path.worldPoints.length;i++){const a=path.worldPoints[i-1],b=path.worldPoints[i];assert.ok(lines.some(l=>l[0]===a.x&&l[1]===a.y&&l[2]===b.x&&l[3]===b.y),path.id);if(path.contact){assert.deepEqual(contacts[i-1].a,a);assert.deepEqual(contacts[i-1].b,b);}}
 }
 // The photographed crossbar remains a visible detail on the decoration.
 assert.equal(p.colliders.some(c=>c.sourceGuideId==='left-return-band'),false);
});


test('all 29 guide paths adopt the latest right-side submission verbatim, without superseded head edges',()=>{
 const submission=JSON.parse(readFileSync(new URL('../reference-review/s8-right-user-layout-20261026/user-layout.json',import.meta.url))),p=board();
 assert.equal(p.sourceGuideTraceVersion,'2026-10-25-user-162747');assert.equal(submission.sourcePaths.length,29);assert.equal(p.sourceGuidePaths.length,29);
 for(const expected of submission.sourcePaths){const actual=p.sourceGuidePaths.find(path=>path.id===expected.id);assert.ok(actual,expected.id);assert.deepEqual(actual.points,expected.points,expected.id);assert.equal(actual.contact,expected.contact,expected.id);assert.deepEqual(actual.worldPoints,expected.points.map(q=>{const[x,y]=sourcePoint(q);return{x,y};}));}
 assert.deepEqual(p.sourceGuidePaths.find(path=>path.id==='right-channel-inner').points[0],[446.3,156.9]);
 assert.equal(p.colliders.some(c=>['lcd-boundary-6','lcd-boundary-7'].includes(c.role)),false);
 assert.equal(p.colliders.some(c=>c.role==='lcd-boundary-5'),false);
 assert.equal(p.colliders.some(c=>c.role==='upper-character-body'),true);
});
