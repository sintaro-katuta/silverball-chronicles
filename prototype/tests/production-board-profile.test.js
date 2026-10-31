import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{PRODUCTION_NORMAL_POWER,productionBoardFlowOptions}from'../src/app/production-board-profile.js';
import{createBoardFlow}from'../src/pixi/board-flow.js';
const plain=x=>JSON.parse(JSON.stringify(x));
test('production preserves diagram centres except the prior five and the proposed local pin 79',()=>{
 const overlay=readFileSync(new URL('../reference-review/tokyoghoul-w-handoff/designer-pin-comparison.html',import.meta.url),'utf8'),centers=[...overlay.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)].map(m=>[Number(m[1]),Number(m[2])]);assert.equal(centers.length,101);
 const options=productionBoardFlowOptions();assert.equal(options.ballRadius,3);assert.equal(options.hesoMouthWidth,16);assert.equal(options.launchRailProfile,'reference-exit');assert.equal(options.leftInletRoute,'diagram');assert.equal(options.normalLaunchSpeedOffset,125);
 for(const pegSeed of [0,1,17,991]){
  const actual=createBoardFlow({lcd:true,pegSeed,...options}).flow.physics;assert.equal(actual.pins.length,101);
  for(let i=0;i<101;i++){assert.equal(actual.pins[i].id,i+1);const approved=JSON.parse(readFileSync(new URL('./fixtures/s8-approved-right-road.json',import.meta.url))).pins.find(p=>p.id===i+1);assert.equal(actual.pins[i].x,approved?.x??(centers[i][0]*.5-14-(i===32?3:0)));assert.equal(actual.pins[i].y,approved?.y??(centers[i][1]*.5+120+(i===78?1:0)));}
  const baseline=createBoardFlow({lcd:true,pegSeed,launchRailProfile:'reference-exit',leftAdmissionGuides:false,hesoMouthWidth:16,ballRadius:3,leftInletRoute:'diagram',guideMechanicsProfile:'continuous-source-v1'}).flow.physics;
  assert.deepEqual(actual.colliders,baseline.colliders);assert.deepEqual(actual.pockets,baseline.pockets);
  assert.equal(actual.mechanisms[0].x,64);assert.equal(actual.mechanisms[0].y,476.5);assert.equal(actual.mechanisms[0].radius,10);assert.equal(actual.mechanisms[0].responseProfile,'light-rotor-v1');
  assert.equal(actual.launchSpeedOffset,125);assert.equal(actual.leftTitleGuard,undefined);assert.equal(actual.colliders.some(c=>c.pixelGuard||c.role==='left-title-body'),false);
 }
});
test('fresh profile and factory clones prevent cross-session mutation; reset reconstruction preserves layout and normal/right launch strengths',()=>{
 const options=productionBoardFlowOptions(),pristine=plain(options),model=createBoardFlow({lcd:true,pegSeed:17,...options}),freshPhysics=plain(model.flow.physics);
 model.flow.physics.pins[47].x+=99;model.flow.physics.mechanisms[0].x+=99;assert.deepEqual(options,pristine);
 const reset=createBoardFlow({lcd:true,pegSeed:17,...options});assert.deepEqual(plain(reset.flow.physics),freshPhysics);
 options.pinPositions[0].x+=99;options.windmillOffset.dx=99;assert.deepEqual(productionBoardFlowOptions(),pristine);
 const board=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),powers=[];board.flow.physics.spawn=(ball,power)=>{powers.push(power);return ball;};
 const fireOne=()=>{const before=powers.length;board.flow.single();for(let i=0;i<73&&powers.length===before;i++)board.flow.step(1/120);assert.equal(powers.length,before+1);};
 for(const [mode,power]of[['normal',.18],['rush',.85],['bonus',.85],['normal',.18]]){board.setMode(mode);fireOne();assert.equal(powers.at(-1),power);}
 board.setNormalPower(.24);board.setMode('rush');fireOne();assert.equal(powers.at(-1),.85);board.setMode('normal');fireOne();assert.equal(powers.at(-1),.24);
});
test('app uses one profile and power constant for initial mount and dock, retaining slider range and reset option forwarding',()=>{
 const main=readFileSync(new URL('../src/app/main.js',import.meta.url),'utf8'),runtime=readFileSync(new URL('../src/pixi/board-runtime.js',import.meta.url),'utf8');assert.match(main,/flowOptions:productionBoardFlowOptions\(\)/);assert.match(main,/import \{PRODUCTION_NORMAL_POWER,productionBoardFlowOptions\}/);assert.equal((main.match(/PRODUCTION_NORMAL_POWER\.toFixed\(2\)/g)||[]).length,2);assert.match(main,/min="0\.18" max="0\.30" step="0\.01"/);assert.match(runtime,/createBoardFlow\(\{\.\.\.flowOptions,lcd:lcdEnabled,launchInterval,pegSeed:unit\?\.pegSeed\?\?0/);
 assert.equal(createBoardFlow({lcd:true}).flow.physics.colliders.some(c=>c.role==='heso-guide'),true);assert.equal(Object.hasOwn(createBoardFlow({lcd:true}).flow.physics.mechanisms[0],'shapeProfile'),false);
});

test('pin and guide alignment leaves all other settings at the user baseline',()=>{
 const baseline=JSON.parse(readFileSync(new URL('./fixtures/non-layout-settings-84f97c4.json',import.meta.url))),actual=productionBoardFlowOptions();
 assert.equal(actual.guideMechanicsProfile,'continuous-source-v1');
 for(const key of ['pinPositions','launchRailProfile','leftInletRoute','guideMechanicsProfile'])delete actual[key];
 assert.equal(actual.hesoMouthWidth,16);assert.equal(baseline.hesoMouthWidth,20);delete actual.hesoMouthWidth;delete baseline.hesoMouthWidth;assert.deepEqual(actual,baseline);
});
