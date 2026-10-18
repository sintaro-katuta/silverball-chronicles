// Explicit local S8 stages. Preflight/analysis never fire balls; measurement needs a frozen source.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {referenceInputs,saveCompressedRaw} from './s6-reference-comparison.mjs';
import {simulationRoot} from './pin-layout-inputs.mjs';
import {preparePinAdjustment} from '../src/dev/pin-adjustment.js';
import {S8_PLAN,s8Cases,inspectS8Cases,measureS8,s8Metrics,rankS8,aggregateS8} from '../src/dev/s8-pin-comparison.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=(p)=>readFile(p,'utf8').then(JSON.parse);
const save=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n');
const head=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:simulationRoot,encoding:'utf8'}).trim();
export async function s8Inputs(planPath){
 const base=await referenceInputs(),paths=['prototype/src/dev/s7-launch-observation.js','prototype/src/dev/s8-pin-comparison.js','prototype/tools/s8-pin-comparison.mjs','prototype/tests/s8-pin-comparison.test.js'],extra=await Promise.all(paths.map(async path=>({path,sha256:sha(await readFile(join(simulationRoot,path)))}))),planSHA=sha(await readFile(planPath));
 return {base,extra,planSHA,sha256:sha(JSON.stringify({base,extra,planSHA})),scope:'All product src, existing mechanical dependencies, actual S7 observer and S8 comparison/runner/test plus locked packages and PM plan. Public assets/media are separately attested, not mechanical inputs.'};
}
export function parseS8Args(args){
 const o={};for(let i=0;i<args.length;i+=2){if(!['--out','--stage','--plan','--expected-source','--baseline-dir','--candidate-dir','--long-dir','--selected','--aim-reviewed'].includes(args[i])||args[i+1]===undefined||o[args[i]])throw new Error('Unknown, missing or duplicate S8 arguments');o[args[i]]=args[i+1];}
 const stage=o['--stage'];if(!o['--out']||!o['--plan']||!['preflight','baseline','candidates','analyze-short','long','analyze-long'].includes(stage))throw new Error('Explicit S8 stage/output/PM plan required');
 if(stage!=='preflight'&&!/^[a-f0-9]{64}$/.test(o['--expected-source']??''))throw new Error('Frozen expected source SHA required');
 if(['candidates','analyze-short','long'].includes(stage)&&(!o['--baseline-dir']||!(o['--aim-reviewed']??'').split(',').includes('baseline')))throw new Error('Fresh baseline directory and PM baseline aim review required');
 if(['analyze-short','long'].includes(stage)&&!o['--candidate-dir'])throw new Error('Candidate directory required');
 if(['long','analyze-long'].includes(stage)&&(!s8Cases().slice(1).some(c=>c.id===o['--selected'])||!(o['--aim-reviewed']??'').split(',').includes(o['--selected'])))throw new Error('Declared screened selection and PM aim review required');
 if(stage==='analyze-long'&&!o['--long-dir'])throw new Error('Long directory required');return o;
}
export async function loadS8Run(dir,expectedSource,stage,expectedKeys){
 const p=await json(join(dir,'provenance.json'));if(!/^[a-f0-9]{40}$/.test(p.commit??'')||p.commit!==p.endCommit)throw new Error('Run Git commits differ');
 if(!/^[a-f0-9]{64}$/.test(p.source?.planSHA??'')||sha(await readFile(join(dir,'pm-plan.executed.md')))!==p.source.planSHA)throw new Error('Executed PM plan SHA mismatch');
 if(p.stage!==stage||!p.success||!p.sourceUnchanged||!p.gitUnchanged||p.source.sha256!==expectedSource||p.endSourceSHA!==expectedSource)throw new Error('Incompatible or unsuccessful S8 run provenance');
 const manifest=await json(join(dir,'raw-manifest.json')),keys=[],results=[];
 for(const m of manifest){if(typeof m.file!=='string'||m.file.includes('/')||m.file.includes('\\')||!m.file.endsWith('.json.gz'))throw new Error('Unsafe raw manifest path');const bytes=await readFile(join(dir,m.file)),plain=gunzipSync(bytes);if(bytes.length!==m.compressedBytes||plain.length!==m.expandedBytes||sha(bytes)!==m.compressedSHA||sha(plain)!==m.expandedSHA)throw new Error('Raw gzip size/SHA mismatch');const r=JSON.parse(plain);if(r.sourceSHA!==expectedSource||m.sourceSHA!==expectedSource||r.configSHA!==m.configSHA||r.layoutSHA!==m.layoutSHA||r.replayFrames.length!==m.frames||r.replayFPS!==30||m.replayFPS!==30)throw new Error('Raw source/config/frame metadata mismatch');
  const prepared=await preparePinAdjustment(r.config);if(prepared.configSHA!==r.configSHA||prepared.layoutSHA!==r.layoutSHA)throw new Error('Raw configuration/layout SHA mismatch');s8Metrics(r);const window=S8_PLAN[stage==='long'?'long':'short'];if(r.conditions.seconds!==window.seconds||r.conditions.drain!==window.drain)throw new Error('Run window mismatch');if(r.replayFrames.some((f,i)=>!Number.isFinite(f.time)||Math.abs(f.time-i/30)>1e-7))throw new Error('Missing/irregular30Hz replay timestamps');if(r.replayFrames.length!==(r.conditions.seconds+r.conditions.drain)*30+1||Math.abs(r.replayFrames[0].time)>1e-8||Math.abs(r.replayFrames.at(-1).time-r.conditions.seconds-r.conditions.drain)>1e-7)throw new Error('Incomplete full-window replay');keys.push(`${r.config.id}/${r.phase}`);results.push(r);
 }
 if(keys.length!==expectedKeys.length||new Set(keys).size!==keys.length||expectedKeys.some(k=>!keys.includes(k))||p.completed!==expectedKeys.length)throw new Error('Missing, duplicate or unexpected S8 result rows');return results;
}
export async function runS8(args){
 const o=parseS8Args(args),stage=o['--stage'],out=resolve(o['--out']),planPath=resolve(o['--plan']),before=await s8Inputs(planPath),inspection=inspectS8Cases(),cases=inspection.filter(r=>r.valid).map(r=>r.config),aimReviewedIds=(o['--aim-reviewed']??'').split(',').filter(Boolean);
 if(stage!=='preflight'&&before.sha256!==o['--expected-source'])throw new Error('Source/plan does not match frozen approval');
 let baseline,short;
 if(['candidates','analyze-short','long'].includes(stage))baseline=await loadS8Run(resolve(o['--baseline-dir']),before.sha256,'baseline',['baseline/0']);
 if(['analyze-short','long'].includes(stage)){const candidates=await loadS8Run(resolve(o['--candidate-dir']),before.sha256,'candidates',cases.slice(1).map(c=>`${c.id}/0`));short=rankS8([...baseline,...candidates],{aimReviewedIds});}
 if(stage==='long'&&short.selected!==o['--selected'])throw new Error('Selected case is not the eligible fresh short winner');
 if(stage==='analyze-short'||stage==='analyze-long'){
  const analysis=stage==='analyze-short'?short:aggregateS8(await loadS8Run(resolve(o['--long-dir']),before.sha256,'long',['baseline',o['--selected']].flatMap(id=>S8_PLAN.long.phases.map(p=>`${id}/${p}`))),o['--selected'],{aimReviewedIds});
  await mkdir(out,{recursive:true});const file=join(out,`${stage}.json`);try{await stat(file);throw new Error('Existing analysis protected; choose a new output directory');}catch(e){if(e.code!=='ENOENT')throw e;}await save(file,{sourceSHA:before.sha256,planSHA:before.planSHA,inspection,...analysis});console.log('ANALYSIS',JSON.stringify(analysis));return;
 }
 await mkdir(out,{recursive:true});try{await stat(join(out,'started-source.json'));throw new Error('Existing run/preflight protected');}catch(e){if(e.code!=='ENOENT')throw e;}
 const window=stage==='long'?S8_PLAN.long:S8_PLAN.short,configs=stage==='candidates'?cases.slice(1):stage==='long'?[cases[0],cases.find(c=>c.id===o['--selected'])]:[cases[0]],provenance={commit:head(),stage,startedAt:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,source:before,success:false};
 const plan={...S8_PLAN,stage,configs,inspection,window,pmPlanSHA:before.planSHA,aimReviewedIds,command:process.argv,sourceGeneration:'Fresh S8 production0.18/legacy/mouth20/tray; no historical outcomes reused.'};
 await save(join(out,'run-plan.json'),plan);await save(join(out,'started-source.json'),provenance);await writeFile(join(out,'pm-plan.executed.md'),await readFile(planPath));await writeFile(join(out,'runner.executed.mjs'),await readFile(fileURLToPath(import.meta.url)));
 if(stage==='preflight'){await save(join(out,'preflight.json'),{source:before,inspection,measurementStarted:false});console.log('PREFLIGHT_ONLY',before.sha256,JSON.stringify(inspection));return;}
 const rows=[],rawManifest=[];let failure;
 await save(join(out,'raw-manifest.json'),rawManifest);
 try{
  for(const config of configs)for(const phase of window.phases){console.log('START',config.id,phase,new Date().toISOString());const start=performance.now(),prepared=await preparePinAdjustment(config),r=measureS8(config,{phase,seconds:window.seconds,drain:window.drain,replaySeconds:window.seconds+window.drain,replayFPS:30,onProgress:p=>{if(p.completedSeconds%30===0)console.log('PROGRESS',config.id,phase,p.completedSeconds,p.stage);}});Object.assign(r,{sourceSHA:before.sha256,configSHA:prepared.configSHA,layoutSHA:prepared.layoutSHA,flowOptions:prepared.flowOptions});const file=`${config.id}-phase-${phase}.json.gz`;rawManifest.push(await saveCompressedRaw(join(out,file),r));await save(join(out,'raw-manifest.json'),rawManifest);
   if(r.replayFrames.length!==(window.seconds+window.drain)*30+1)throw new Error('Full-window30Hz replay incomplete');const metrics=s8Metrics(r);rows.push({file,...metrics,wallMilliseconds:performance.now()-start});await save(join(out,'partial-summary.json'),{rows,skipped:inspection.filter(r=>!r.valid)});console.log('RESULT',JSON.stringify(rows.at(-1)));}
  await save(join(out,'summary.json'),{rows,rawManifest,skipped:inspection.filter(r=>!r.valid),decision:'PM screen/long aim review required; no automatic progression or adoption.'});
 }catch(error){failure=error;await save(join(out,'failure.json'),{message:error.message,...(error.result?{result:error.result}:{})});}
 finally{try{const after=await s8Inputs(planPath),endCommit=head();Object.assign(provenance,{endCommit,gitUnchanged:endCommit===provenance.commit,finishedAt:new Date().toISOString(),endSourceSHA:after.sha256,sourceUnchanged:before.sha256===after.sha256,success:!failure&&before.sha256===after.sha256&&endCommit===provenance.commit,completed:rows.length,skipped:inspection.filter(r=>!r.valid)});if(!provenance.success&&!failure)failure=new Error('S8 source/plan/Git HEAD changed');}catch(error){provenance.guardFailure=error.message;failure??=error;}await save(join(out,'provenance.json'),provenance);}
 if(failure)throw failure;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await runS8(process.argv.slice(2));
