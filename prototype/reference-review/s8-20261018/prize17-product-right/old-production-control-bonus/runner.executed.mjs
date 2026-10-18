// PM-owned, finite right-route acceptance: one fresh case/mode per invocation.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {join,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {admissionInputs} from './s8-admission-comparison.mjs';
import {saveCompressedRaw} from './s6-reference-comparison.mjs';
import {simulationRoot} from './pin-layout-inputs.mjs';
import {preparePinAdjustment} from '../src/dev/pin-adjustment.js';
import {prepareAdmissionCase} from '../src/dev/s8-admission-comparison.js';
import {measurePinAdjustment} from '../src/dev/pin-adjustment-measurement.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';

const sha=b=>createHash('sha256').update(b).digest('hex');
const save=(path,value)=>writeFile(path,JSON.stringify(value,null,2)+'\n');
const head=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:simulationRoot,encoding:'utf8'}).trim();
const ownPath='prototype/tools/s8-prize17-integration.mjs';
const manifestRelative='prototype/tools/s8-prize17-integration-cases.json';
const candidateId='three-prize17-left200';
const oldConfig={id:'old-production-control',label:'旧本編・元配置・口20・追加ガイドあり',leftAdmissionGuides:true,hesoMouthWidth:20,launchRailProfile:'legacy',normalPower:.18,moves:[],windmillOffset:{dx:0,dy:0},windmillShapeProfile:'legacy-capsules'};
const plain=x=>JSON.parse(JSON.stringify(x));
const stationary=ms=>ms.map(({angle,omega,lastHit,...geometry})=>geometry);
const fixedKeys=['gravity','ballRadius','colliders','pockets','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'];
const fixedView=p=>Object.fromEntries(fixedKeys.map(k=>[k,k==='gravity'?690:p[k]]));

export function parseIntegrationArgs(args){
 const o={};
 for(let i=0;i<args.length;i+=2){
  if(!['--out','--plan','--manifest','--case','--mode','--phase','--stage','--expected-source','--expected-head'].includes(args[i])||args[i+1]===undefined||Object.hasOwn(o,args[i]))throw Error('Unknown/missing/duplicate integration arguments');
  o[args[i]]=args[i+1];
 }
 if(!['--out','--plan','--manifest','--case','--mode','--phase','--stage'].every(k=>o[k])||!['old-production-control',candidateId].includes(o['--case'])||!['rush','bonus'].includes(o['--mode'])||o['--phase']!=='0'||!['preflight','run'].includes(o['--stage']))throw Error('Explicit single approved case, rush/bonus, phase0, stage, plan/manifest/output required');
 if(o['--stage']==='run'&&(!/^[a-f0-9]{64}$/.test(o['--expected-source']??'')||!/^[a-f0-9]{40}$/.test(o['--expected-head']??'')))throw Error('Frozen full source SHA and HEAD required');
 return o;
}

export async function integrationInputs(plan,manifest){
 const base=await admissionInputs(plan,manifest);
 const allSource=[];
 async function walk(dir){for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const path=join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Symlink in integration source');if(entry.isDirectory())await walk(path);else if(entry.isFile())allSource.push({path:relative(simulationRoot,path),sha256:sha(await readFile(path))});}}
 await walk(join(simulationRoot,'prototype/src'));
 const paths=[ownPath,manifestRelative,'prototype/src/app/production-board-profile.js','prototype/tests/production-board-profile.test.js','package.json'];
 const extra=await Promise.all(paths.map(async path=>({path,sha256:sha(await readFile(join(simulationRoot,path)))})));
 const body={base,allSource,extra,planSHA:base.planSHA,caseManifestSHA:base.caseManifestSHA};
 return {...body,sha256:sha(JSON.stringify(body)),scope:'All product src and existing measurement dependencies/lockfiles, integration runner and exact two-case manifest, production profile and its tests, executed plan. No media inputs.'};
}

export async function prepareIntegrationCase(manifestBytes,id){
 const m=JSON.parse(manifestBytes.toString());
 assert.equal(m.version,1);assert.equal(m.cases?.length,2);
 assert.deepEqual(m.cases.map(c=>c.id),['old-production-control',candidateId]);
 assert.deepEqual(m.cases[0],oldConfig);
 const accepted=JSON.parse(await readFile(join(simulationRoot,'prototype/tools/s8-prize17-cases.json'),'utf8')).cases.find(c=>c.id===candidateId);
 assert.deepEqual(m.cases[1],accepted,'Accepted candidate must be copied without changes');
 const config=m.cases.find(c=>c.id===id);assert.ok(config,'Unknown case');
 const prepared=id===candidateId?await prepareAdmissionCase(config):await preparePinAdjustment(config);
 if(id===candidateId){
  const production=productionBoardFlowOptions();
  assert.deepEqual(prepared.flowOptions,production,'Production flowOptions differ from accepted trial');
  assert.deepEqual(plain(createBoardFlow({lcd:true,...prepared.flowOptions}).flow.physics),plain(createBoardFlow({lcd:true,...production}).flow.physics),'Production and trial factory initial data differ');
 }
 return {config,prepared};
}

export function integrationSummary(r){
 const targetKind=r.conditions.mode;
 const lcd=Object.fromEntries(['centreBallIds','boundaryOnlyBallIds','frontCentreBallIds','frontBoundaryOnlyBallIds'].map(k=>[k,r.lcdIntrusion[k].length]));
 return {caseId:r.config.id,mode:targetKind,phase:r.phase,actualShots:r.physical.shots,start:r.end.counts.start,targetKind,targetAdmission:r.end.counts[targetKind],general:r.end.counts.normal,fuzu:r.end.counts.fuzu,OUT:r.end.counts.out,returned:r.end.counts.returned,returnRate:r.physical.shots?r.end.counts.returned/r.physical.shots:null,residual:r.end.remaining,stalled:r.endDiagnostics.stalled,LCD:lcd,counts:structuredClone(r.end.counts),countsValid:r.physical.reconciled&&r.physical.uniqueOutcomeIds&&r.physical.allOutcomesFromShots&&r.physical.countsMatchOutcomes,pairedReturnRateReview:'Compare candidate returned/actualShots to same-mode old-production-control after all four records. This single run does not establish paired acceptance.',accountingScope:'Mechanical trial only; no SessionGame payout or lottery acceptance.'};
}

export function validateIntegrationResult(r,config,prepared,mode){
 assert.deepEqual(r.config,config);assert.deepEqual(r.flowOptions,prepared.flowOptions);
 assert.equal(r.phase,0);assert.equal(r.kind,'mechanical');
 const c=r.conditions;
 assert.equal(c.mode,mode);assert.equal(c.phase,0);assert.equal(c.kind,'mechanical');assert.equal(c.seconds,30);assert.equal(c.drain,45);assert.equal(c.power,.85);assert.equal(c.launchInterval,.6);assert.equal(c.updateSeconds,1/120);assert.equal(c.gravity,690);assert.equal(c.mouthWidth,20);assert.equal(c.ballRadius,1.8);assert.equal(Object.hasOwn(c,'shotLimit'),false);
 assert.equal(c.guide,config.leftAdmissionGuides?'current-factory-tray':'source-walls-retained-no-added-heso-tray');assert.equal(r.railGeometry.profile,'legacy');assert.equal(r.session,null);assert.equal(r.ledger,null);
 const model=createBoardFlow({lcd:true,...prepared.flowOptions});model.setMode(mode);
 assert.deepEqual(r.pins,model.flow.physics.pins);assert.equal(r.pins.length,101);assert.equal(new Set(r.pins.map(p=>p.id)).size,101);assert.deepEqual(r.pinsAtEnd,r.pins);
 assert.deepEqual(Object.fromEntries(fixedKeys.map(k=>[k,r.fixed[k]])),plain(fixedView(model.flow.physics)));
 assert.deepEqual(r.fixed.mechanisms,plain(model.flow.physics.mechanisms));
 for(let i=0;i<9000;i++)model.flow.step(1/120); // Empty normalization oracle only, never launches.
 assert.deepEqual(Object.fromEntries(fixedKeys.map(k=>[k,r.fixedAtEnd[k]])),plain(fixedView(model.flow.physics)));
 const mechanismGeometry=stationary(model.flow.physics.mechanisms);
 assert.deepEqual(stationary(r.fixedAtEnd.mechanisms),plain(mechanismGeometry));
 assert.equal(r.replayFPS,30);assert.equal(r.replayFrames.length,2251);
 assert.equal(r.replaySampling.stopStep,3600);assert.equal(r.replaySampling.endStep,9000);assert.equal(r.replaySampling.regularFrames,2251);
 assert.ok(Math.abs(r.atStop.time-30)<1e-7);assert.ok(Math.abs(r.end.time-75)<1e-7);
 const shots=r.events.filter(e=>e.type==='shot'),outcomes=r.events.filter(e=>e.type==='outcome');
 const ids=new Set(shots.map(e=>e.ballId)),outIds=new Set(outcomes.map(e=>e.ballId));
 assert.ok(shots.length>0);assert.equal(ids.size,shots.length);assert.equal(outIds.size,outcomes.length);assert.equal(r.physical.shots,shots.length);assert.equal(r.physical.outcomes,outcomes.length);assert.ok(outcomes.every(e=>ids.has(e.ballId)));assert.ok(shots.every(e=>Number.isFinite(e.time)&&e.time>=0&&e.time<=30+1e-8));
 assert.equal(outcomes.length+r.end.remaining,shots.length);
 assert.ok(['reconciled','uniqueOutcomeIds','allOutcomesFromShots','countsMatchOutcomes'].every(k=>r.physical[k]===true));
 assert.deepEqual(Object.keys(r.end.counts).sort(),Object.keys(model.flow.counts).sort());
 for(const[k,n]of Object.entries(r.end.counts)){assert.ok(Number.isSafeInteger(n)&&n>=0);assert.equal(outcomes.filter(e=>e.kind===k).length,n);}
 const checkFrame=f=>{
  assert.equal(f.inFlight,f.balls.length);assert.equal(f.spawned,Object.values(f.counts).reduce((a,b)=>a+b,0)+f.balls.length);assert.deepEqual(Object.keys(f.counts).sort(),Object.keys(r.end.counts).sort());assert.ok(Object.values(f.counts).every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.deepEqual(stationary(f.mechanisms),plain(mechanismGeometry));assert.ok(f.mechanisms.every(m=>Number.isFinite(m.angle)&&Number.isFinite(m.omega)));
  assert.equal(new Set(f.balls.map(b=>b.id)).size,f.balls.length);assert.ok(f.balls.every(b=>ids.has(b.id)&&b.r===1.8&&[b.x,b.y,b.vx,b.vy].every(Number.isFinite)));
 };
 for(const[i,f]of r.replayFrames.entries()){assert.ok(Math.abs(f.time-i/30)<1e-7);checkFrame(f);}
 for(const[key,state]of [['stop',r.atStop],['end',r.end]]){const f=r.replayEndpoints[key];assert.ok(f);assert.ok(Math.abs(f.time-state.time)<1e-8);assert.deepEqual(f.counts,state.counts);assert.equal(f.inFlight,state.remaining);checkFrame(f);}
 assert.equal(r.display.ballRadius,1.8);assert.equal(r.display.textureExtent,28);assert.equal(r.display.spriteScaleDivisor,3);assert.equal(r.display.displayBallScale,model.flow.physics.displayBallScale);assert.equal(r.display.displayBallDiameter,model.flow.physics.displayBallDiameter??null);assert.equal(r.display.spriteBoundingDiameter,28*model.flow.physics.displayBallScale/3);
 const summary=integrationSummary(r);
 assert.ok(summary.targetAdmission>0,'No actual target-kind right admission');
 assert.equal(summary.residual,0);assert.equal(summary.stalled,0);assert.ok(Object.values(summary.LCD).every(n=>n===0));
 return summary;
}

export async function runIntegrationCase(args){
 const o=parseIntegrationArgs(args),out=resolve(o['--out']),plan=resolve(o['--plan']),manifest=resolve(o['--manifest']),manifestBytes=await readFile(manifest),{config,prepared}=await prepareIntegrationCase(manifestBytes,o['--case']),before=await integrationInputs(plan,manifest),commit=head();
 if(o['--stage']==='run'){assert.equal(before.sha256,o['--expected-source'],'Frozen source/plan/manifest changed');assert.equal(commit,o['--expected-head'],'Frozen HEAD changed');}
 await mkdir(out,{recursive:true});assert.equal((await readdir(out)).length,0,'Existing output directory protected');
 const provenance={stage:o['--stage'],caseId:config.id,mode:o['--mode'],phase:0,commit,source:before,node:process.version,platform:process.platform,arch:process.arch,startedAt:new Date().toISOString(),measurementStarted:false,success:false};
 await save(join(out,'started-source.json'),provenance);await writeFile(join(out,'pm-plan.executed.md'),await readFile(plan));await writeFile(join(out,'cases.executed.json'),manifestBytes);await writeFile(join(out,'runner.executed.mjs'),await readFile(fileURLToPath(import.meta.url)));
 await save(join(out,'run-plan.json'),{case:config,mode:o['--mode'],phase:0,firingSeconds:30,drainSeconds:45,replayFPS:30,power:.85,configSHA:prepared.configSHA,layoutSHA:prepared.layoutSHA,flowOptions:prepared.flowOptions,command:process.argv,scope:'One fresh right mode only. Product/trial factory match checked; four-case paired return-rate acceptance remains PM/independent review.'});
 let failure,result,rawSaved=false;
 try{
  if(o['--stage']==='preflight'){await save(join(out,'preflight.json'),{source:before,config,flowOptions:prepared.flowOptions,pins:prepared.pins,measurementStarted:false});provenance.status='preflight-only';console.log('PREFLIGHT_ONLY',before.sha256,commit,config.id,o['--mode']);}
  else{
   provenance.measurementStarted=true;
   try{result=measurePinAdjustment(config,{phase:0,kind:'mechanical',mode:o['--mode'],seconds:30,drain:45,replaySeconds:75,replayFPS:30,recordFinalState:true});}catch(error){failure=error;result=error.result;}
   if(result){
    Object.assign(result,{sourceSHA:before.sha256,planSHA:before.planSHA,caseManifestSHA:before.caseManifestSHA,configSHA:prepared.configSHA,layoutSHA:prepared.layoutSHA,flowOptions:prepared.flowOptions});
    await save(join(out,'raw-manifest.json'),[await saveCompressedRaw(join(out,'result.json.gz'),result)]);rawSaved=true;
    await save(join(out,'summary.json'),{...integrationSummary(result),validationPassed:false});
    const summary=validateIntegrationResult(result,config,prepared,o['--mode']);
    if(!failure){await save(join(out,'summary.json'),{...summary,validationPassed:true});provenance.status='completed';console.log('RESULT',JSON.stringify(summary));}
   }
   assert.ok(result,'Measurement did not return a raw result');if(failure)throw failure;
  }
 }catch(error){failure??=error;await save(join(out,'failure.json'),{message:failure.message,...(failure!==error?{secondaryFailure:error.message}:{}),actualShots:result?.physical?.shots??null,counts:result?.end?.counts??null,rawSaved});}
 finally{
  try{const after=await integrationInputs(plan,manifest),endCommit=head();Object.assign(provenance,{finishedAt:new Date().toISOString(),endCommit,endSourceSHA:after.sha256,sourceUnchanged:before.sha256===after.sha256,gitUnchanged:commit===endCommit});if(!provenance.sourceUnchanged||!provenance.gitUnchanged)failure??=Error('Source/plan/manifest/HEAD changed');}catch(error){provenance.guardFailure=error.message;failure??=error;}
  provenance.success=!failure;await save(join(out,'provenance.json'),provenance);
 }
 if(failure){await save(join(out,'failure.json'),{message:failure.message,actualShots:result?.physical?.shots??null,counts:result?.end?.counts??null,rawSaved,sourceUnchanged:provenance.sourceUnchanged??null,gitUnchanged:provenance.gitUnchanged??null});throw failure;}
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await runIntegrationCase(process.argv.slice(2));
