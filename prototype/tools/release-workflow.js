import {createHash,randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile,rename,rm,readdir,lstat,cp} from 'node:fs/promises';
import {resolve,relative,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';

const sha=data=>createHash('sha256').update(data).digest('hex');
export const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export const targetName='tsukikage-pachinko';
export const candidatePath=root=>join(root,'prototype/.cache/release/candidate.json');
const outputPath=root=>join(root,'prototype/dist-release');
export const candidateAssets=(root,id)=>join(root,'prototype/.cache/release/candidates',id,'assets');
const expectedRoutes=['silverball-chronicles.sintaro-katuta.com','tsukikage.sintaro-katuta.com'];
async function readTarget(root){const bytes=await readFile(join(root,'prototype/wrangler.jsonc'));let config;try{config=JSON.parse(bytes);}catch{throw new Error('Target configuration must use the supported strict JSON subset of JSONC');}
 const routes=config.routes?.map(r=>({pattern:r.pattern,custom_domain:r.custom_domain}));
 if(config.name!==targetName||config.assets?.directory!=='./dist-release'||config.workers_dev!==true||!Array.isArray(routes)||routes.length!==expectedRoutes.length||routes.some((r,i)=>r.pattern!==expectedRoutes[i]||r.custom_domain!==true))throw new Error('Unexpected Worker name, routes or assets configuration');
 return {name:config.name,routes,workersDev:config.workers_dev,sha256:sha(bytes)};
}
export function parseCommand(args){const [action,...flags]=args;if(!['prepare','verify','publish'].includes(action))throw new Error('Unknown release action');const options={};for(let i=0;i<flags.length;i+=2){const key=flags[i],value=flags[i+1];if(!value||value.startsWith('--')||Object.hasOwn(options,key))throw new Error('Missing or duplicate release argument');if(action==='prepare'&&key==='--issues'&&/^\d+(,\d+)*$/.test(value))options[key]=value;else if(action==='publish'&&key==='--confirm-target')options[key]=value;else throw new Error(`Unknown release argument: ${key}`);}
 if(action==='publish'&&options['--confirm-target']!==targetName)throw new Error(`Manual publish requires --confirm-target ${targetName} after explicit approval for this candidate`);
 return {action,confirmTarget:options['--confirm-target'],issues:options['--issues']?.split(',').map(Number)??[]};
}
const sourceInputs=['.github/workflows','package.json','prototype/package.json','prototype/package-lock.json','prototype/vite.config.js','prototype/wrangler.jsonc','prototype/src','prototype/public','prototype/tests','prototype/tools'];

// Enumerate regular files only. A candidate never follows symlinks outside its tree.
export async function inventory(base){
 const files=[];
 async function visit(path){const stat=await lstat(path);
  if(stat.isSymbolicLink())throw new Error(`Symlink is not allowed: ${path}`);
  if(stat.isDirectory()){for(const name of (await readdir(path)).sort())await visit(join(path,name));}
  else if(stat.isFile()){const bytes=await readFile(path);files.push({path:relative(base,path).split('\\').join('/'),size:bytes.length,sha256:sha(bytes)});}
  else throw new Error(`Unsupported release input: ${path}`);
 }
 await visit(base);return files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
}
export async function sourceFingerprint(root){
 const files=[];
 for(const input of sourceInputs){const absolute=join(root,input),stat=await lstat(absolute);
  if(stat.isSymbolicLink())throw new Error(`Symlink is not allowed: ${input}`);
  if(stat.isDirectory())for(const file of await inventory(absolute))files.push({...file,path:`${input}/${file.path}`});
  else{const bytes=await readFile(absolute);files.push({path:input,size:bytes.length,sha256:sha(bytes)});}
 }
 files.sort((a,b)=>a.path.localeCompare(b.path,'en'));return {sha256:sha(JSON.stringify(files)),files};
}
export function runCommand(command,args,{cwd,env=process.env}={}){
 return new Promise((accept,reject)=>{const child=spawn(command,args,{cwd,env,stdio:['ignore','pipe','pipe']});let output='';
  child.stdout.on('data',data=>{output+=data;process.stdout.write(data);});child.stderr.on('data',data=>{output+=data;process.stderr.write(data);});
  child.on('error',reject);child.on('exit',(code,signal)=>code===0?accept(output):reject(new Error(`${command} ${args.join(' ')} failed (${code??signal})`)));
 });
}
async function availablePort(){return new Promise((accept,reject)=>{const server=net.createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>accept(port));});});}
export async function startPreview(root,{env=process.env}={}){
 const port=await availablePort(),url=`http://127.0.0.1:${port}`;
 const child=spawn(process.execPath,[join(root,'prototype/node_modules/vite/bin/vite.js'),'preview','--mode','release','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:join(root,'prototype'),env,stdio:['ignore','pipe','pipe']});
 let launchError;child.on('error',error=>{launchError=error;});child.stdout.on('data',data=>process.stdout.write(data));child.stderr.on('data',data=>process.stderr.write(data));
 const close=async()=>{if(child.exitCode!==null||child.signalCode!==null)return;const exited=new Promise(accept=>child.once('exit',accept));child.kill('SIGTERM');await Promise.race([exited,new Promise(accept=>setTimeout(accept,3000))]);if(child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await exited;}};
 try{const deadline=Date.now()+30000;while(Date.now()<deadline){if(launchError)throw launchError;if(child.exitCode!==null||child.signalCode!==null)throw new Error('Release preview exited before readiness');try{const response=await fetch(url,{signal:AbortSignal.timeout(1000)});if(response.ok)return {url,close};}catch{}await new Promise(accept=>setTimeout(accept,100));}throw new Error('Release preview readiness timeout');}
 catch(error){await close();throw error;}
}
function assertManifest(manifest,expectedStatus='verified'){
 if(manifest?.schema!==1||manifest.status!==expectedStatus||manifest.target!==targetName||! /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(manifest.candidateId??'')||!Array.isArray(manifest.assets)||!manifest.assets.length||!/^([a-f0-9]{64})$/.test(manifest.source?.sha256??'')||!/^([a-f0-9]{64})$/.test(manifest.configSha256??''))throw new Error('Invalid release candidate manifest');
 const paths=new Set();for(const file of manifest.assets){if(typeof file.path!=='string'||file.path.startsWith('/')||file.path.includes('\\')||file.path.split('/').some(part=>!part||part==='.'||part==='..')||paths.has(file.path)||!Number.isSafeInteger(file.size)||file.size<0||!/^[a-f0-9]{64}$/.test(file.sha256))throw new Error('Invalid release asset record');paths.add(file.path);}
 if(!paths.has('index.html'))throw new Error('Release candidate has no index.html');
}
export async function verifyCandidate(root,{expectedStatus='verified'}={}){
 if(!['verified','browser-verified'].includes(expectedStatus))throw new Error('Invalid candidate validation status');
 let manifest;try{manifest=JSON.parse(await readFile(candidatePath(root),'utf8'));}catch(error){throw new Error(`Release candidate unavailable: ${error.message}`);}
 assertManifest(manifest,expectedStatus);
 const assets=await inventory(candidateAssets(root,manifest.candidateId));if(JSON.stringify(assets)!==JSON.stringify(manifest.assets))throw new Error('Release assets changed: file set, size or SHA256 mismatch');
 const source=await sourceFingerprint(root);if(source.sha256!==manifest.source.sha256)throw new Error('Release source inputs changed since verification');
 const target=await readTarget(root);if(target.sha256!==manifest.configSha256||JSON.stringify(target)!==JSON.stringify(manifest.targetConfiguration))throw new Error('Release target configuration changed');
 return manifest;
}
// Wall-clock phase evidence is private, excluded from source/asset inventories.
export async function phaseRecorder(root,{clock=()=>performance.now(),now=()=>new Date().toISOString(),kind='prepare'}={}){
 if(!['prepare','unit'].includes(kind))throw new Error('Invalid timing kind');
 const path=join(root,`prototype/.cache/release/timings/${kind}.json`);await mkdir(dirname(path),{recursive:true});
 const evidence={schema:1,startedAt:now(),node:process.version,runId:process.env.GITHUB_RUN_ID??null,runAttempt:process.env.GITHUB_RUN_ATTEMPT??null,phases:[]};
 const save=async()=>{const temp=`${path}.tmp`;await writeFile(temp,JSON.stringify(evidence,null,2)+'\n');await rename(temp,path);};await save();
 return async(label,operation)=>{const start=clock(),record={label,startedAt:now(),status:'running'};evidence.phases.push(record);await save();console.log(`Release phase start: ${label}`);
  let operationError;try{const result=await operation();record.status='success';return result;}catch(error){operationError=error;record.status='failure';throw error;}
  finally{record.elapsedWallMs=Math.max(0,clock()-start);record.completedAt=now();try{await save();}catch(error){if(!operationError)throw error;console.error(`Phase evidence write failed after ${label}: ${error.message}`);}console.log(`Release phase end: ${label} ${record.status} ${record.elapsedWallMs.toFixed(1)}ms`);}
 };
}
export async function prepareRelease(root,{run=runCommand,preview=startPreview,now=()=>new Date().toISOString(),issues=[],checksMode='all'}={}){
 const path=candidatePath(root);await mkdir(dirname(path),{recursive:true});await rm(path,{force:true});const candidateId=randomUUID(),assetsDir=candidateAssets(root,candidateId);let server,temp;const checkOutputs=[];const phase=await phaseRecorder(root,{now});if(!['all','browser'].includes(checksMode))throw new Error('Invalid check mode');
 try{const before=await sourceFingerprint(root),target=await readTarget(root),checks=[];
  for(const script of (checksMode==='all'?['test','build:release']:['build:release'])){console.log(`Release check: ${script}`);checkOutputs.push(await phase(script,()=>run('npm',['run',script],{cwd:root})));checks.push(script);}
  const built=await inventory(outputPath(root));server=await phase('preview readiness',()=>preview(root));
  for(const args of [['--prefix','prototype','run','test:release'],['run','test:browser']]){checkOutputs.push(await phase(args.join(' '),()=>run('npm',args,{cwd:root,env:{...process.env,REVIEW_URL:server.url}})));checks.push(args.join(' '));}
  checkOutputs.push(await phase('feedback.browser.mjs',()=>run(process.execPath,['prototype/tests/feedback.browser.mjs'],{cwd:root,env:{...process.env,REVIEW_URL:server.url,FEEDBACK_OUTPUT:join(dirname(assetsDir),'feedback/')+ '/'}})));checks.push('feedback.browser.mjs');
  const assets=await inventory(outputPath(root));if(JSON.stringify(assets)!==JSON.stringify(built))throw new Error('Release assets changed during browser verification');
  const source=await sourceFingerprint(root);if(source.sha256!==before.sha256)throw new Error('Release source inputs changed during preparation');
  const commit=(await run('git',['rev-parse','HEAD'],{cwd:root})).trim(),dirtyStatus=await run('git',['status','--porcelain=v1'],{cwd:root});
  await mkdir(dirname(assetsDir),{recursive:true});await cp(outputPath(root),assetsDir,{recursive:true,errorOnExist:true,force:false});if(JSON.stringify(await inventory(assetsDir))!==JSON.stringify(assets))throw new Error('Frozen candidate copy does not match verified assets');
  await writeFile(join(dirname(assetsDir),'checks.log'),checkOutputs.join('\n'));
  const npmVersion=(await run('npm',['--version'],{cwd:root})).trim(),versions={};for(const name of ['vite','wrangler','@playwright/test']){try{versions[name]=JSON.parse(await readFile(join(root,'prototype/node_modules',name,'package.json'),'utf8')).version;}catch{versions[name]=null;}}
  const browserVersion=checkOutputs.join('\n').match(/Chrome: ([^\r\n]+)/)?.[1]??null;
  const manifest={schema:1,status:checksMode==='all'?'verified':'browser-verified',candidateId,issueNumbers:issues,logPath:`prototype/.cache/release/candidates/${candidateId}/checks.log`,createdAt:now(),target:targetName,targetConfiguration:target,git:{commit,dirty:!!dirtyStatus.trim(),status:dirtyStatus.trimEnd()},source,configSha256:target.sha256,conditions:{node:process.version,npm:npmVersion,chrome:browserVersion,packages:versions,platform:process.platform,url:server.url,viewports:['390x844','1440x900'],checks,notes:'Local Chrome emulation; physical devices and audio listening unverified'},assets};
  await server.close();server=null;temp=`${path}.${randomUUID()}.tmp`;await writeFile(temp,JSON.stringify(manifest,null,2)+'\n');await rename(temp,path);temp=null;
  if(manifest.status==='verified')console.log(`Verified local release candidate: ${path}`);else console.log(`Browser-verified candidate pending unit aggregation: ${path}`);return manifest;
 }catch(error){await rm(path,{force:true});await rm(dirname(assetsDir),{recursive:true,force:true});throw error;}finally{if(server)await server.close();if(temp)await rm(temp,{force:true});}
}
export async function publishRelease(root,{confirmTarget,run=runCommand}={}){
 if(confirmTarget!==targetName)throw new Error(`Manual publish requires --confirm-target ${targetName} after explicit approval for this candidate`);
 const manifest=await verifyCandidate(root);
 // Publish exactly this directory; never invoke build or prepare here.
 await run(process.execPath,[join(root,'prototype/node_modules/wrangler/bin/wrangler.js'),'deploy','--config',join(root,'prototype/wrangler.jsonc'),'--name',targetName,'--assets',candidateAssets(root,manifest.candidateId)],{cwd:join(root,'prototype')});
 return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const {action,confirmTarget,issues}=parseCommand(process.argv.slice(2));if(action==='prepare')await prepareRelease(projectRoot,{issues});else if(action==='verify'){await verifyCandidate(projectRoot);console.log('Verified candidate assets, source inputs and target configuration.');}else await publishRelease(projectRoot,{confirmTarget});}
 catch(error){console.error(`Release workflow failed: ${error.message}`);process.exitCode=1;}
}
