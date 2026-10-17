// One declared setting and phase per invocation; no batch or automatic adoption.
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
import {referenceInputs,saveCompressedRaw} from './s6-reference-comparison.mjs';
import {simulationRoot} from './pin-layout-inputs.mjs';
import {preparePinAdjustment} from '../src/dev/pin-adjustment.js';
import {ADMISSION_CONDITIONS,inspectAdmissionCase,measureAdmissionCase,validateAdmissionResult,summarizeAdmissionResult,evaluateRightSafety} from '../src/dev/s8-admission-comparison.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const save=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n');
const head=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:simulationRoot,encoding:'utf8'}).trim();
export async function admissionInputs(planPath,manifestPath){
 const base=await referenceInputs(),paths=['prototype/src/dev/s8-wheel-shape-comparison.js','prototype/tests/fixtures/windmill-photo-three-vane.json','prototype/src/pixi/windmill-offset.js','prototype/src/dev/s8-windmill-comparison.js','prototype/src/dev/s8-shot-comparison.js','prototype/src/dev/s7-launch-observation.js','prototype/src/dev/s8-admission-comparison.js','prototype/tools/s8-admission-comparison.mjs','prototype/tests/s8-admission-comparison.test.js'],extra=await Promise.all(paths.map(async path=>({path,sha256:sha(await readFile(join(simulationRoot,path)))}))),planSHA=sha(await readFile(planPath)),caseManifestSHA=sha(await readFile(manifestPath));
 return {base,extra,planSHA,caseManifestSHA,sha256:sha(JSON.stringify({base,extra,planSHA,caseManifestSHA})),scope:'Product src and existing mechanical dependencies plus optional non-acting final snapshots, actual S7 observer, declared admission single-case runner/tests, locked dependencies, PM plan and exact case-manifest bytes. Media excluded.'};
}
export async function loadRightSafety(root,source,commit){
 const results=[],records=[];
 for(const id of ['three-base','ball-r20'])for(const mode of ['rush','bonus']){
  const dir=join(root,`${id}-${mode}`),read=async f=>JSON.parse(await readFile(join(dir,f),'utf8')),p=await read('provenance.json'),manifest=await read('raw-manifest.json');
  if(p.success!==true||p.sourceUnchanged!==true||p.gitUnchanged!==true||p.commit!==commit||p.endCommit!==commit||p.source?.sha256!==source.sha256||p.endSourceSHA!==source.sha256||p.source.planSHA!==source.planSHA||p.source.caseManifestSHA!==source.caseManifestSHA||p.mode!==mode||p.caseId!==id||p.phase!==0||manifest.length!==1)throw new Error('Right proof source/HEAD/coverage differs');
  if(sha(await readFile(join(dir,'pm-plan.executed.md')))!==source.planSHA||sha(await readFile(join(dir,'cases.executed.json')))!==source.caseManifestSHA)throw new Error('Right proof executed plan/manifest differs');
  const m=manifest[0];if(typeof m.file!=='string'||m.file.includes('/')||m.file.includes('\\')||!m.file.endsWith('.json.gz'))throw new Error('Unsafe right raw path');
  const bytes=await readFile(join(dir,m.file)),plain=gunzipSync(bytes);if(bytes.length!==m.compressedBytes||plain.length!==m.expandedBytes||sha(bytes)!==m.compressedSHA||sha(plain)!==m.expandedSHA)throw new Error('Right raw compressed/expanded hash differs');
  const r=JSON.parse(plain),prepared=await preparePinAdjustment(r.config);
  if(r.config.id!==id||r.conditions.mode!==mode||r.phase!==0||r.sourceSHA!==source.sha256||m.sourceSHA!==source.sha256||r.planSHA!==source.planSHA||r.caseManifestSHA!==source.caseManifestSHA||r.configSHA!==prepared.configSHA||r.layoutSHA!==prepared.layoutSHA||m.configSHA!==prepared.configSHA||m.layoutSHA!==prepared.layoutSHA||JSON.stringify(r.flowOptions)!==JSON.stringify(prepared.flowOptions)||m.frames!==r.replayFrames.length||m.replayFPS!==30)throw new Error('Right proof condition/geometry metadata differs');
  validateAdmissionResult(r);results.push(r);records.push({directory:dir,compressedSHA:m.compressedSHA,expandedSHA:m.expandedSHA});
 }
 return {...evaluateRightSafety(results),sourceSHA:source.sha256,commit,records};
}
export function parseShotArgs(args){
 const o={};for(let i=0;i<args.length;i+=2){if(!['--out','--plan','--manifest','--case','--phase','--expected-source','--stage','--mode','--right-root'].includes(args[i])||args[i+1]===undefined||o[args[i]])throw new Error('Unknown/missing/duplicate single-case arguments');o[args[i]]=args[i+1];}
 if(!['normal','rush','bonus'].includes(o['--mode']))throw new Error('Explicit normal/rush/bonus mode required');
 if(o['--mode']!=='normal'&&(Number(o['--phase'])!==0||!['three-base','ball-r20'].includes(o['--case'])))throw new Error('Right safety only for fresh baseline/B phase0');
 if(!o['--out']||!o['--plan']||!o['--manifest']||!o['--case']||!ADMISSION_CONDITIONS.phases.includes(Number(o['--phase']))||o['--phase']===undefined||!['preflight','run'].includes(o['--stage']))throw new Error('Explicit stage,output,plan,manifest,case and phase required');
 if(o['--stage']==='run'&&!/^[a-f0-9]{64}$/.test(o['--expected-source']??''))throw new Error('Frozen expected source SHA required');return o;
}
export function readCaseManifest(text,id){const manifest=JSON.parse(text);if(manifest.version!==1||!Array.isArray(manifest.cases)||!manifest.cases.length||new Set(manifest.cases.map(c=>c.id)).size!==manifest.cases.length)throw new Error('Invalid/duplicate case manifest');const config=manifest.cases.find(c=>c.id===id);if(!config)throw new Error('Case is not in frozen manifest');return config;}
export async function runAdmissionCase(args){
 const o=parseShotArgs(args),out=resolve(o['--out']),planPath=resolve(o['--plan']),manifestPath=resolve(o['--manifest']),manifest=await readFile(manifestPath),config=readCaseManifest(manifest.toString(),o['--case']),before=await admissionInputs(planPath,manifestPath),inspected=inspectAdmissionCase(config),phase=Number(o['--phase']),mode=o['--mode'];
 if(o['--stage']==='run'&&before.sha256!==o['--expected-source'])throw new Error('Source/plan/manifest differs from frozen approval');
 await mkdir(out,{recursive:true});try{await stat(join(out,'started-source.json'));throw new Error('Existing record protected');}catch(e){if(e.code!=='ENOENT')throw e;}
 const provenance={stage:o['--stage'],caseId:config.id,phase,mode,commit:head(),source:before,node:process.version,platform:process.platform,arch:process.arch,startedAt:new Date().toISOString(),success:false,measurementStarted:false};
 await save(join(out,'started-source.json'),provenance);await save(join(out,'run-plan.json'),{...ADMISSION_CONDITIONS,case:config,phase,mode,configSHA:sha(JSON.stringify(config)),inspection:{valid:inspected.valid,skipReason:inspected.skipReason??null,windmill:inspected.windmillInspection??null},command:process.argv,scope:'Single setting/phase; report actual shots and start after every run. Only declared pin90 displacement or diagram ball ratio, separate hypotheses with fixed photo rotor. No coefficient changes, automatic next trial or adoption.'});await writeFile(join(out,'pm-plan.executed.md'),await readFile(planPath));await writeFile(join(out,'cases.executed.json'),manifest);await writeFile(join(out,'runner.executed.mjs'),await readFile(fileURLToPath(import.meta.url)));
 let failure,result,rawSaved=false;
 try{
  if(!inspected.valid){provenance.status='skipped-invalid';await save(join(out,'skip.json'),{case:config,phase,reason:inspected.skipReason,measurementStarted:false});console.log('SKIPPED',config.id,phase,inspected.skipReason);}
  else if(o['--stage']==='preflight'){provenance.status='preflight-only';await save(join(out,'preflight.json'),{source:before,config,pins:inspected.layout.pins,flowOptions:inspected.layout.flowOptions,windmillInspection:inspected.windmillInspection,measurementStarted:false});console.log('PREFLIGHT_ONLY',before.sha256,config.id,phase);}
  else{
   if(config.id==='ball-r20'&&mode==='normal'){if(!o['--right-root'])throw new Error('Fresh four-record right safety proof required before B normal');const proof=await loadRightSafety(resolve(o['--right-root']),before,provenance.commit);await save(join(out,'right-safety-proof.json'),proof);if(!proof.eligible)throw new Error('B rejected by fresh right safety observations');}
   provenance.measurementStarted=true;const prepared=await preparePinAdjustment(config);const started=performance.now();console.log('START',config.id,phase,mode,new Date().toISOString());
   try{result=measureAdmissionCase(config,{phase,mode,onProgress:p=>{if(p.completedSeconds%30===0)console.log('PROGRESS',config.id,phase,p.completedSeconds,p.stage);}});}catch(error){if(error.result)result=error.result;failure=error;}
   if(result){Object.assign(result,{sourceSHA:before.sha256,planSHA:before.planSHA,caseManifestSHA:before.caseManifestSHA,configSHA:prepared.configSHA,layoutSHA:prepared.layoutSHA,flowOptions:prepared.flowOptions});const raw=await saveCompressedRaw(join(out,'result.json.gz'),result);await save(join(out,'raw-manifest.json'),[raw]);rawSaved=true;validateAdmissionResult(result,{requireLimit:!failure});if(!failure){const summary={...summarizeAdmissionResult(result),file:raw.file,wallMilliseconds:performance.now()-started};await save(join(out,'summary.json'),summary);console.log('RESULT',JSON.stringify(summary));provenance.status='completed';}}
   if(failure)throw failure;
  }
 }catch(error){failure??=error;await save(join(out,'failure.json'),{message:failure.message,...(failure!==error?{secondaryFailure:error.message}:{}),actualShots:result?.physical?.shots??null,start:result?.end?.counts?.start??null,rawSaved});console.error('FAILED',config.id,phase,result?.physical?.shots??'unknown','shots',result?.end?.counts?.start??'unknown','start',error.message);}
 finally{try{const after=await admissionInputs(planPath,manifestPath),endCommit=head();Object.assign(provenance,{finishedAt:new Date().toISOString(),endCommit,gitUnchanged:endCommit===provenance.commit,endSourceSHA:after.sha256,sourceUnchanged:after.sha256===before.sha256,success:!failure&&inspected.valid&&after.sha256===before.sha256&&endCommit===provenance.commit});if((!provenance.sourceUnchanged||!provenance.gitUnchanged)&&!failure)failure=new Error('Source/plan/manifest/HEAD changed');}catch(error){provenance.guardFailure=error.message;failure??=error;}await save(join(out,'provenance.json'),provenance);}
 if(failure)throw failure;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await runAdmissionCase(process.argv.slice(2));
