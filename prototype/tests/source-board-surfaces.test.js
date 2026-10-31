import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{createBoardFlow}from'../src/pixi/board-flow.js';import{productionBoardFlowOptions}from'../src/app/production-board-profile.js';
import{sourceBoardSurfaces,paintSourceBoardEdges,sourceBoardTexturePoint}from'../src/pixi/source-board-surfaces.js';
import{traceSourceBoardSilhouette}from'../src/pixi/board-silhouette.js';import{sourcePoint,SCREEN_SOURCE}from'../src/pixi/source-layout.js';
const board=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;
const submitted=JSON.parse(readFileSync(new URL('../reference-review/s8-right-user-layout-20261026/user-layout.json',import.meta.url))).lines.map(p=>({...p,contact:p.kind==='guide'}));
test('mechanical surfaces retain authored edges plus the continuous guard without mutating physics',()=>{
 const p=board(),before=JSON.stringify(p),parts=sourceBoardSurfaces(p);assert.equal(parts.strips.length,submitted.filter(p=>p.contact&&p.name!=='右下ひし形').length+2);assert.deepEqual(parts.opening,SCREEN_SOURCE);
 const lines=[];paintSourceBoardEdges({poly(){},line(...args){lines.push(args);}},sourceBoardTexturePoint,parts);
 for(const original of submitted.filter(p=>p.contact&&p.name!=='右下ひし形')){const face=parts.strips.find(p=>p.id===original.id);assert.deepEqual(face.points,original.points,original.id);assert.deepEqual(face.face.slice(0,original.points.length),original.points);
  for(let i=1;i<original.points.length;i++){if(face.decorationLine)continue;const a=sourceBoardTexturePoint(original.points[i-1]),b=sourceBoardTexturePoint(original.points[i]);assert.ok(lines.some(l=>l[0]===a[0]&&l[1]===a[1]&&l[2]===b[0]&&l[3]===b[1]),original.id);}
 }
 for(const detail of parts.details.filter(p=>!p.recessedGuide))for(let i=1;i<detail.points.length;i++){const a=sourceBoardTexturePoint(detail.points[i-1]),b=sourceBoardTexturePoint(detail.points[i]);assert.equal(lines.some(l=>l[0]===a[0]&&l[1]===a[1]&&l[2]===b[0]&&l[3]===b[1]),false,detail.id);}
 assert.equal(JSON.stringify(p),before);parts.strips[0].points[0][0]+=99;assert.equal(JSON.stringify(p),before);
});
test('carrier and relief contours include the user extended head and straight right discharge instead of cutting them off with a round bowl',()=>{
 const p=board(),parts=sourceBoardSurfaces(p),right=submitted.find(q=>q.id==='right-outside-back-edge');assert.deepEqual(parts.exteriorRight,right.points);
 assert.ok(parts.upperRelief.some(q=>q[0]===446.3&&q[1]===156.9));assert.ok(parts.rightRelief.some(q=>q[0]===775&&q[1]===613));
 const drawn=[],path={moveTo(...v){drawn.push(['M',...v]);return this;},lineTo(...v){drawn.push(['L',...v]);return this;},bezierCurveTo(...v){drawn.push(['C',...v]);return this;},closePath(){return this;}};traceSourceBoardSilhouette(path,parts,p.railVisibleShape);
 for(const q of right.points){const[x,y]=sourcePoint(q);assert.ok(drawn.some(v=>v[0]==='L'&&v[1]===x&&v[2]===y));}
 assert.equal(drawn.some(v=>v[0]==='C'&&v[1]===394&&v[2]===475),false);
});
test('isolated legacy previews retain their rendering and no mechanical surfaces are manufactured without the source profile',()=>{
 assert.equal(sourceBoardSurfaces(createBoardFlow({lcd:true}).flow.physics),null);assert.equal(sourceBoardSurfaces(createBoardFlow().flow.physics),null);
});
