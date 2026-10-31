import test from 'node:test';import assert from 'node:assert/strict';
import {feedbackOptions} from '../tools/s8-play-feedback.mjs';
import {createBoardFlow} from '../src/pixi/board-flow.js';import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {OPEN_LEFT_OUTER_RAIL_SOURCE,OPEN_LEFT_LCD_OUTLINE_SOURCE,visibleLeftInletRails} from '../src/pixi/left-inlet-route.js';
import {sourcePoint,sourcePath,FRAME_SOURCE} from '../src/pixi/source-layout.js';
import {PROTECTED_TITLE_SOLID} from '../src/pixi/left-title-guide.js';
import {circlePolygonContact,prepareSolidPolygon} from '../src/physics/solid-polygon-contact.js';
import {paintLunarReliefs} from '../src/pixi/lunar-relief-art.js';
const make=()=>createBoardFlow({lcd:true,...feedbackOptions('open-title-route')});
test('open route removes the title enclosure, preserves nails, and uses the existing LCD wall as its inner rail',()=>{
 const p=make().flow.physics,base=createBoardFlow({lcd:true,...feedbackOptions('open-title-route'),leftInletRoute:'legacy'}).flow.physics;
 assert.equal(p.leftInletRoute,'open-title');assert.equal(p.leftTitleGuard,undefined);assert.deepEqual(p.pins,base.pins);assert.equal(p.pins.length,101);assert.ok(!p.colliders.some(c=>c.pixelGuard||c.role==='left-title-body'));
 const points=sourcePath(OPEN_LEFT_OUTER_RAIL_SOURCE).map(([x,y])=>({x,y})),outer=p.colliders.filter(c=>c.role==='left-inlet-guide');assert.deepEqual(outer.map(({a,b})=>({a,b})),points.slice(1).map((b,i)=>({a:points[i],b})));
 assert.deepEqual(p.colliders.filter(c=>c.role!=='left-inlet-guide'),base.colliders.filter(c=>c.role!=='left-inlet-guide'));assert.equal(visibleLeftInletRails(p).length,6);assert.ok(visibleLeftInletRails(p).every(c=>p.colliders.includes(c)));
 const [x,y]=sourcePoint([165,450]),old=prepareSolidPolygon(sourcePath(FRAME_SOURCE).map(([x,y])=>({x,y}))),next=prepareSolidPolygon(sourcePath(OPEN_LEFT_LCD_OUTLINE_SOURCE).map(([x,y])=>({x,y})));
 assert.equal(circlePolygonContact({x,y,r:.001},old).inside,true);assert.equal(circlePolygonContact({x,y,r:.001},next),null);
 assert.throws(()=>createBoardFlow({leftInletRoute:'open-title'}));assert.throws(()=>createBoardFlow({lcd:true,leftInletRoute:'unknown'}));assert.throws(()=>createBoardFlow({lcd:true,leftInletRoute:'open-title',leftTitleGuard:true}));
});
test('title lettering is omitted while the rest of the cabinet art still draws',()=>{
 const draw=hideLeftTitle=>{const letters=[],shapes=[];const c={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},fillText(ch){letters.push(ch);}};paintLunarReliefs({c,poly:(...a)=>shapes.push(a),line(){},plate:(...a)=>shapes.push(a),at:p=>p,includeSword:false,hideLeftTitle});return {letters,shapes};};
 assert.equal(draw(false).letters.length,8);const open=draw(true);assert.equal(open.letters.length,0);assert.ok(open.shapes.length>5);
});
test('a real falling ball can enter behind the removed title and discharge into the inlet pins',()=>{
 const m=make();m.setMode('normal');const p=m.flow.physics,[x,y]=sourcePoint([170,375]),b=p.spawn({},.18);Object.assign(b,{x,y,vx:0,vy:20,leftLaunchPlane:true,launchExitCrossed:true});let entered=false,discharged=false;
 for(let i=0;i<5*120;i++){m.flow.step(1/120);if(circlePolygonContact({...b,r:.001},PROTECTED_TITLE_SOLID)?.inside)entered=true;if(b.y>=404.25)discharged=true;}
 assert.ok(entered);assert.ok(discharged);assert.equal(m.flow.counts.returned,0);
});
test('natural launches enter the former title region and the same ball IDs exit downstream',()=>{
 const m=make();m.setMode('normal');const p=m.flow.physics,entered=new Set(),passed=new Set();let stop=null;
 m.flow.start();for(let i=0;i<100*120;i++){if(p.metrics.spawned>=30&&stop===null){m.flow.stop();stop=p.time;}m.flow.step(1/120);for(const b of p.balls)if(b.leftLaunchPlane){if(circlePolygonContact({...b,r:.001},PROTECTED_TITLE_SOLID)?.inside)entered.add(b.id);if(entered.has(b.id)&&b.y>=404.25)passed.add(b.id);}if(stop!==null&&p.time-stop>45)break;}
 assert.equal(p.metrics.spawned,30);assert.ok(entered.size>=15,`only ${entered.size} entered rear route`);assert.deepEqual(passed,entered);assert.equal(m.flow.counts.returned,0);
});
