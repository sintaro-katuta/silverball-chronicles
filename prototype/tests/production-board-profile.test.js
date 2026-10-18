import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{PRODUCTION_NORMAL_POWER,productionBoardFlowOptions}from'../src/app/production-board-profile.js';
import{createBoardFlow}from'../src/pixi/board-flow.js';
import{prepareAdmissionCase}from'../src/dev/s8-admission-comparison.js';
const plain=x=>JSON.parse(JSON.stringify(x));
const accepted=JSON.parse(readFileSync(new URL('../tools/s8-prize17-cases.json',import.meta.url))).cases.find(c=>c.id==='three-prize17-left200');
test('production profile exactly matches accepted geometry and preserves original101 attributes and84 positions for multiple peg seeds',async()=>{
 const prepared=await prepareAdmissionCase(accepted),options=productionBoardFlowOptions();assert.deepEqual(options,prepared.flowOptions);assert.equal(PRODUCTION_NORMAL_POWER,.18);assert.equal(Object.hasOwn(options,'ballRadius'),false);
 for(const pegSeed of[0,1,17,991]){
  const original=createBoardFlow({lcd:true,pegSeed}).flow.physics,actual=createBoardFlow({lcd:true,pegSeed,...options}).flow.physics,expected=createBoardFlow({lcd:true,pegSeed,...prepared.flowOptions}).flow.physics;
  assert.deepEqual(plain(actual),plain(expected));assert.equal(actual.pins.length,101);assert.equal(new Set(actual.pins.map(p=>p.id)).size,101);
  for(const pin of actual.pins){const old=original.pins.find(p=>p.id===pin.id);assert.deepEqual(pin,{...old,x:old.x+(pin.id>=47&&pin.id<=63?-2:0)});}
  assert.equal(actual.ballRadius,1.8);assert.equal(actual.displayBallScale,original.displayBallScale);assert.equal(actual.colliders.some(c=>c.role==='heso-guide'),false);assert.equal(actual.mechanisms[0].shapeProfile,'photo-three-vane');assert.equal(actual.pockets.find(p=>p.kind==='start').w,20);
  // Adoption changes only the declared parts; compare every other initial field.
  const unchanged=plain(original),adopted=plain(actual);delete unchanged.pins;delete adopted.pins;unchanged.colliders=unchanged.colliders.filter(c=>c.role!=='heso-guide');delete adopted.mechanisms[0].shapeProfile;delete adopted.mechanisms[0].shapeVersion;assert.deepEqual(adopted,unchanged);
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
