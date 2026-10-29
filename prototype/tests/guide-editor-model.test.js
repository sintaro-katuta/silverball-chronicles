import test from 'node:test';import assert from 'node:assert/strict';
import {initialDocument,validateDocument,importDocument,exportDocument,createHistory,clone,cubicSegments,pointOnSegment,sampledPoints,linePath,nearestInsertion} from '../src/dev/guide-editor-model.js';
const line=overrides=>({id:'user-test',sourceTemplateId:null,name:'手で合わせた線',kind:'guide',mode:'polyline',closed:false,reviewed:true,visible:true,points:[[20,30],[70,90],[130,40],[180,120]],...overrides});
const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
test('saved work round-trips edits, visibility, completion, curve mode and deletion mapping',()=>{
 const doc=initialDocument();doc.lines.splice(0,1);doc.lines[0].points[0]=[130.5,340.2];doc.lines[0].mode='curve';doc.lines[0].reviewed=true;doc.lines[0].visible=false;doc.lines.push(line());
 const payload=exportDocument(doc);assert.deepEqual(importDocument(JSON.parse(JSON.stringify(payload))),doc);assert.ok(payload.removedSourceIds.includes('left-inlet'));assert.equal(payload.sourcePaths.at(-1).points.length,4);assert.equal(payload.sourcePaths[0].reviewed,true);
 // Derived coordinates from a file never override the editable source points.
 payload.sourcePaths[0].points=[[99999,99999]];assert.notDeepEqual(exportDocument(importDocument(payload)).sourcePaths[0].points,payload.sourcePaths[0].points);
});
test('invalid imports reject non-finite/out-of-image coordinates, duplicate IDs, wrong references and excessive data without mutating work',()=>{
 const doc={lines:[line()]},original=clone(doc);
 for(const point of[[NaN,0],[Infinity,0],[-1,20],[905,20],[20,1281],[20,30,40]]){const bad=clone(doc);bad.lines[0].points[0]=point;assert.throws(()=>validateDocument(bad));}
 assert.throws(()=>validateDocument({lines:[line(),line()]}));assert.throws(()=>importDocument({...exportDocument(doc),reference:{width:100,height:100}}));assert.throws(()=>validateDocument({lines:Array.from({length:301},(_,i)=>line({id:`line-${i}`}))}));assert.deepEqual(doc,original);
});
test('a gesture commits once; undo, redo and new branches preserve complete independent documents',()=>{
 const before={lines:[line()]},history=createHistory(before),moved=clone(before);moved.lines[0].points[0]=[40,50];assert.equal(history.commit(moved),true);moved.lines[0].points[0][0]=999;assert.equal(history.value.lines[0].points[0][0],40);history.undo();assert.deepEqual(history.value,before);history.redo();assert.equal(history.value.lines[0].points[0][0],40);history.undo();history.commit({lines:[]});assert.equal(history.canRedo,false);history.undo();assert.deepEqual(history.value,before);
});
test('curve handoff samples interpolate user anchors and remain within .16 source px of the displayed cubic',()=>{
 for(const closed of[false,true]){const l=line({mode:'curve',closed}),samples=sampledPoints(l);assert.ok(linePath(l).includes('C'));for(const p of l.points)assert.ok(samples.some(s=>Math.hypot(p[0]-s[0],p[1]-s[1])<.001));
  for(const segment of cubicSegments(l))for(let i=0;i<=200;i++){const p=pointOnSegment(segment,i/200),near=Math.min(...samples.slice(1).map((b,j)=>distance(p,samples[j],b)));assert.ok(near<=.16,`curve error ${near}`);}
 }
});
test('adding a point finds the actual curved segment and closed straight edges retain their closing edge',()=>{
 const l=line({mode:'curve'}),s=cubicSegments(l)[1],p=pointOnSegment(s,.4),hit=nearestInsertion(l,p);assert.equal(hit.index,2);assert.ok(hit.distance<.02);const closed=line({closed:true}),close=nearestInsertion(closed,[60,50]);assert.ok(close);assert.deepEqual(sampledPoints(closed).at(-1),closed.points[0]);
});

test('edge curves stay inside the reference and opening an empty work file remains valid',()=>{
 const l=line({mode:'curve',points:[[0,0],[1,40],[0,80],[904,1280]]});for(const s of cubicSegments(l))for(let i=0;i<=100;i++){const[x,y]=pointOnSegment(s,i/100);assert.ok(x>=0&&x<=904&&y>=0&&y<=1280);}
 assert.deepEqual(importDocument(exportDocument({lines:[]})),{lines:[]});
});
