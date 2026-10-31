import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {installSourceElectricBody} from '../src/pixi/source-electric-body.js';import {sourceBoardSurfaces} from '../src/pixi/source-board-surfaces.js';import {sourcePath} from '../src/pixi/source-layout.js';import {circlePolygonContact} from '../src/physics/solid-polygon-contact.js';
const make=()=>createBoardFlow({lcd:true,...productionBoardFlowOptions()}).flow.physics;
const winding=(p,ps)=>{let n=0;for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],cross=(b.x-a.x)*(p.y-a.y)-(p.x-a.x)*(b.y-a.y);if(a.y<=p.y&&b.y>p.y&&cross>0)n++;if(a.y>p.y&&b.y<=p.y&&cross<0)n--;}return n;};
test('electric solid uses exactly the lobes painted by the unchanged nonzero source outline',()=>{
 const p=make(),art=sourceBoardSurfaces(p),pins=structuredClone(p.pins),paths=structuredClone(p.sourceGuidePaths),old=structuredClone(p.colliders);installSourceElectricBody(p);
 assert.deepEqual(sourceBoardSurfaces(p),art);assert.deepEqual(p.pins,pins);assert.deepEqual(p.sourceGuidePaths,paths);assert.equal(JSON.stringify(p.colliders.slice(0,old.length)),JSON.stringify(old));
 const solids=p.colliders.filter(c=>c.role==='source-electric-body').map(c=>c.solid);assert.ok(solids.length>0);
 const outline=sourcePath(art.electricFace).map(([x,y])=>({x,y}));
 for(let y=518.031;y<558;y+=.5)for(let x=246.017;x<291;x+=.5){const b={x,y,r:1e-8};assert.equal(solids.some(s=>circlePolygonContact(b,s)?.inside),winding(b,outline)!==0);}
 assert.ok(solids.some(s=>circlePolygonContact({x:565.953*.5-14,y:822.261*.5+120,r:3},s)?.inside));
});
