import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareRelease,publishRelease,verifyCandidate,candidatePath,projectRoot,targetName,runCommand} from './release-workflow.js';
export const productionURL='https://silverball-chronicles.sintaro-katuta.com';
const versionPattern=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const shaPattern=/^[a-f0-9]{40}$/;
const uuidPattern=/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const assetDigest=manifest=>digest(manifest.assets);
export const checkpointPath=root=>join(root,'prototype/.cache/release/cd-state.json');
export function parseReleaseSummary(body,version){
 const blocks=[...(body??'').matchAll(/```json\s*([\s\S]*?)```/g)];let summary;
 for(const block of blocks){try{const value=JSON.parse(block[1]);if(value.silverballReleaseSummary){if(summary)throw new Error('Duplicate release summary');summary=value.silverballReleaseSummary;}}catch(error){if(error.message==='Duplicate release summary')throw error;}}
 if(!summary||summary.version!==version||!Array.isArray(summary.sprints)||summary.sprints.length!==3||new Set(summary.sprints).size!==3||!summary.sprints.every(n=>Number.isSafeInteger(n)&&n>0)||!Array.isArray(summary.issues)||!summary.issues.length||new Set(summary.issues).size!==summary.issues.length||!summary.issues.every(n=>Number.isSafeInteger(n)&&n>0))throw new Error('Release PR requires one matching summary for three distinct Sprints and accepted Issues');
 for(const key of ['improvements','fixes','knownLimitations'])if(!Array.isArray(summary[key])||!summary[key].every(s=>typeof s==='string'&&s.trim()&&s.length<=1000))throw new Error(`Invalid release summary ${key}`);
 if(!summary.improvements.length&&!summary.fixes.length)throw new Error('Release summary must describe user-facing changes');return summary;
}
export function validatePR(event){const pr=event.pull_request;if(!pr||pr.head?.repo?.full_name!==event.repository?.full_name)throw new Error('PR must originate in this repository');
 const base=pr.base?.ref,head=pr.head?.ref;
 if(head?.startsWith('sprint/')&&head.length>7&&base?.startsWith('release/')&&versionPattern.test(base.slice(8)))return {kind:'sprint',version:base.slice(8)};
 if(base==='main'&&head?.startsWith('release/')&&versionPattern.test(head.slice(8)))return {kind:'release',version:head.slice(8),summary:parseReleaseSummary(pr.body,head.slice(8))};
 throw new Error('PR must be sprint/* → release/<version> or release/<version> → main');
}
export function validateCD({enabled,event,eventName='pull_request',repository,checkoutSHA,packageVersion,mainSHA,tagSHA,release,latestRelease}){
 if(enabled!=='true')throw new Error('Production CD is disabled');
 const pr=event.pull_request;
 if(eventName!=='pull_request'||event.action!=='closed'||pr?.merged!==true||pr.base?.ref!=='main'||event.repository?.full_name!==repository||pr.head?.repo?.full_name!==repository)throw new Error('Production requires a merged same-repository release PR into main');
 const version=pr.head?.ref?.startsWith('release/')?pr.head.ref.slice(8):'';
 if(!versionPattern.test(version)||version!==packageVersion)throw new Error('Release branch suffix and package version must match');
 const sha=pr.merge_commit_sha;if(!shaPattern.test(sha??'')||checkoutSHA!==sha)throw new Error('Checkout and current main must equal the PR merge commit');
 if(tagSHA&&tagSHA!==sha)throw new Error('Version tag already belongs to another commit');
 if(release){const match=release.body?.match(/<!-- silverball-release:(.*?) -->/);let record;try{record=JSON.parse(match?.[1]??'');}catch{}
  if(release.tag_name!==version||!record||record.version!==version||record.sha!==sha||record.worker!==targetName||record.status!=='smoke-verified'||record.summaryDigest!==digest(parseReleaseSummary(pr.body,version))||!uuidPattern.test(record.cloudflareVersionId??''))throw new Error('Existing Release has no matching verified deployment record');
  if(!tagSHA)throw new Error('Existing Release is missing its version tag');
 }
 if(!release||release.draft){if(mainSHA!==sha)throw new Error('Unfinished release merge is no longer current main');if(latestRelease){if(!versionPattern.test(latestRelease.tag_name??''))throw new Error('Latest Release does not use the version policy');const a=latestRelease.tag_name.split('.').map(Number),b=version.split('.').map(Number);let newer=false;for(let i=0;i<3;i++){if(b[i]>a[i]){newer=true;break;}if(b[i]<a[i])break;}if(!newer)throw new Error('New releases must be newer than the latest published version');}}
 return {version,sha,tag:version,repository,summary:parseReleaseSummary(pr.body,version),alreadyReleased:!!release&&!release.draft};
}
export function releaseNotes(context,generated,record){
 if(record&&(record.status!=='smoke-verified'||record.version!==context.version||record.sha!==context.sha||record.worker!==targetName||!uuidPattern.test(record.cloudflareVersionId??'')||!record.smokeVerifiedAt))throw new Error('Success notes require a matching smoke-verified deployment');
 const s=context.summary,lines=[`# ${context.version}`];if(!record)lines.push('公開候補：まだ公開成功を確認していません。');
 for(const [key,title] of [['improvements','改善'],['fixes','修正'],['knownLimitations','既知の制限']])if(s[key].length)lines.push(`\n## ${title}`, ...s[key].map(text=>`- ${text.replaceAll('<!-- silverball-release:','&lt;!-- silverball-release:')}`));
 lines.push(`\n対象Sprint：${s.sprints.join(', ')}。対象Issue：${s.issues.map(n=>`[#${n}](https://github.com/${context.repository}/issues/${n})`).join(', ')}。`,`版の対応：${context.version} / [${context.sha.slice(0,8)}](https://github.com/${context.repository}/commit/${context.sha})。`);
 if(record)lines.push(`公開日：${record.smokeVerifiedAt}。\n公開版：[遊ぶ](${productionURL})。`,`\n## 自動生成された変更履歴\n${generated.replaceAll('<!-- silverball-release:','&lt;!-- silverball-release:')}`,`\n<!-- silverball-release:${JSON.stringify(record)} -->`);
 return lines.join('\n')+'\n';
}
export async function executeCD(context,{prepare,deploy,verifyPublic,smoke,saveCheckpoint,createRelease,refreshMain,generateNotes,getCurrentDeployment,checkpoint,now=()=>new Date().toISOString()}){
 if(context.alreadyReleased)return {status:'already-released',version:context.version,sha:context.sha};
 const candidate=await prepare(context.summary.issues);
 if(candidate.git.commit!==context.sha||candidate.git.dirty)throw new Error('CD candidate must be built from the clean merge commit');
 if(await refreshMain()!==context.sha)throw new Error('Main moved during verification');
 const generated=await generateNotes(context);let record;
 if(checkpoint){if(checkpoint.version!==context.version||checkpoint.sha!==context.sha||checkpoint.worker!==targetName||checkpoint.summaryDigest!==digest(context.summary)||checkpoint.assetDigest!==assetDigest(candidate)||checkpoint.sourceSHA!==candidate.source.sha256||!['pre-deploy','deployed','smoke-verified'].includes(checkpoint.status))throw new Error('Checkpoint does not match this verified candidate');record={...checkpoint};
  if(record.status==='pre-deploy'){const current=await getCurrentDeployment();if(JSON.stringify(current)!==JSON.stringify(record.previousDeployment))throw new Error('Prior deployment changed after an incomplete deploy attempt; reconcile before retry');}
  else if(!uuidPattern.test(record.cloudflareVersionId??''))throw new Error('Invalid checkpoint Cloudflare Version');
 }else{const previousDeployment=await getCurrentDeployment();record={version:context.version,sha:context.sha,worker:targetName,repository:context.repository,summaryDigest:digest(context.summary),candidateId:candidate.candidateId,assetDigest:assetDigest(candidate),sourceSHA:candidate.source.sha256,previousDeployment,status:'pre-deploy',preparedAt:now()};await saveCheckpoint(record);}
 if(record.status==='pre-deploy'){const cloudflareVersionId=await deploy(candidate);if(!uuidPattern.test(cloudflareVersionId??''))throw new Error('Deploy did not report a Cloudflare Version ID');record.cloudflareVersionId=cloudflareVersionId;record.status='deployed';record.deployedAt=now();await saveCheckpoint(record);}
 // A checkpoint is not proof of what the public URL serves now.
 const publicEvidence=await verifyPublic(candidate,record);record.publicDeploymentId=publicEvidence.deploymentId;record.publicAssetsVerifiedAt=now();await smoke(candidate);
 if(await refreshMain()!==context.sha)throw new Error('Main moved before release publication');
 record.status='smoke-verified';record.smokeVerifiedAt=now();await saveCheckpoint(record);
 const notes=releaseNotes(context,generated,record),release=await createRelease(context,notes,candidate,record);
 return {status:'released',version:context.version,sha:context.sha,cloudflareVersionId:record.cloudflareVersionId,release};
}
export function deploymentSnapshot(response){const current=response.success===true?response.result?.deployments?.[0]:null;
 if(!current||!uuidPattern.test(current.id??'')||!Array.isArray(current.versions)||!current.versions.length||current.versions.some(v=>!uuidPattern.test(v.version_id??'')||!(v.percentage>0))||Math.abs(current.versions.reduce((sum,v)=>sum+v.percentage,0)-100)>1e-6)throw new Error('Cannot record current Cloudflare deployment for rollback');
 return {id:current.id,createdOn:current.created_on,versions:current.versions.map(v=>({version_id:v.version_id,percentage:v.percentage}))};
}
export function verifyCurrentDeployment(response,record){
 const current=response.success===true?response.result?.deployments?.[0]:null,versions=current?.versions;
 if(!current||!Array.isArray(versions)||versions.length!==1||versions[0].version_id!==record.cloudflareVersionId||versions[0].percentage!==100)throw new Error('Recorded Cloudflare Version is not the current 100% traffic deployment');
 return {deploymentId:current.id,versionId:versions[0].version_id};
}
export async function verifyPublicAssets(candidate,{fetcher=fetch,url=productionURL,retries=5,sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 const files=candidate.assets.filter(f=>f.path!=='_headers');
 for(const file of files){let ok=false;for(let attempt=0;attempt<retries;attempt++){
  try{const response=await fetcher(new URL(file.path==='index.html'?'/':file.path+'?release='+candidate.candidateId,url+'/'),{cache:'no-store',signal:AbortSignal.timeout(15000)});
   if(response.ok){const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length===file.size&&createHash('sha256').update(bytes).digest('hex')===file.sha256){ok=true;break;}}}catch{}
  if(attempt+1<retries)await sleep(1000);
 }if(!ok)throw new Error(`Public candidate asset mismatch: ${file.path}`);}
 return {filesChecked:files.length,excluded:['_headers']};
}
function githubClient(token,fetcher=fetch){return async(path,{method='GET',body,optional404=false}={})=>{
 const response=await fetcher(`https://api.github.com${path}`,{method,headers:{authorization:`Bearer ${token}`,accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10',...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 if(optional404&&response.status===404)return null;if(!response.ok)throw new Error(`GitHub API ${method} ${path} failed (${response.status})`);return response.status===204?null:response.json();
};}
async function readTag(api,repo,version){let ref=await api(`/repos/${repo}/git/ref/tags/${version}`,{optional404:true});if(!ref)return null;let object=ref.object;for(let depth=0;object?.type==='tag'&&depth<3;depth++)object=(await api(`/repos/${repo}/git/tags/${object.sha}`)).object;if(object?.type!=='commit'||!shaPattern.test(object.sha??''))throw new Error('Unrecognized version tag target');return object.sha;}
export async function publishGitHubRelease(api,context,notes,candidate,record,{read=readFile,fetcher=fetch,token,root=projectRoot}={}){
 const tagSHA=await readTag(api,context.repository,context.version);if(tagSHA&&tagSHA!==context.sha)throw new Error('Version tag moved before Release creation');
 const prefix=`/repos/${context.repository}`,existing=await api(`${prefix}/releases/tags/${context.version}`,{optional404:true});
 if(existing){const marker=existing.body?.match(/<!-- silverball-release:(.*?) -->/);let stored;try{stored=JSON.parse(marker?.[1]??'');}catch{}if(!stored||stored.status!=='smoke-verified'||['sha','version','worker','sourceSHA','assetDigest','summaryDigest','cloudflareVersionId'].some(key=>stored[key]!==record[key]))throw new Error('Draft Release no longer matches this deployment');}
 if(existing&&!existing.draft)throw new Error('Release was published while this run was preparing');
 let release=existing??await api(`${prefix}/releases`,{method:'POST',body:{tag_name:context.tag,target_commitish:context.sha,name:context.version,body:notes,draft:true,prerelease:false}});
 if(existing)release=await api(`${prefix}/releases/${release.id}`,{method:'PATCH',body:{body:notes,name:context.version}});
 const attachments=[['candidate-manifest.json',JSON.stringify(candidate,null,2)],['release-record.json',JSON.stringify(record,null,2)],['release-notes.md',notes]];
 for(const [name,content] of attachments){const previous=release.assets?.find(a=>a.name===name);if(previous)await api(`${prefix}/releases/assets/${previous.id}`,{method:'DELETE'});
  const upload=new URL(release.upload_url.replace(/\{.*$/,''));if(upload.hostname!=='uploads.github.com')throw new Error('Unexpected release upload host');upload.searchParams.set('name',name);
  const response=await fetcher(upload,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':name.endsWith('.json')?'application/json':'text/markdown'},body:content,signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Release attachment ${name} failed (${response.status})`);
 }
 const published=await api(`${prefix}/releases/${release.id}`,{method:'PATCH',body:{draft:false,make_latest:'true'}});if(published.draft!==false)throw new Error('GitHub did not confirm Release publication');return published.html_url;
}
async function saveJSON(path,value){await mkdir(dirname(path),{recursive:true});const tmp=path+'.tmp';await writeFile(tmp,JSON.stringify(value,null,2)+'\n');await rename(tmp,path);}
async function restoreCheckpoint(api,repo,runId,sha){
 if(!/^\d+$/.test(runId??''))throw new Error('CD requires a GitHub run ID');
 const artifacts=await api(`/repos/${repo}/actions/runs/${runId}/artifacts`),name=`cd-checkpoint-${runId}`;
 const artifact=artifacts.artifacts?.find(a=>a.name===name&&!a.expired);if(!artifact)return null;
 if(artifact.workflow_run?.head_sha!==sha)throw new Error('Checkpoint artifact belongs to another merge commit');
 const dest=join(projectRoot,'prototype/.cache/release/restored-checkpoint');await mkdir(dest,{recursive:true});
 await runCommand('gh',['run','download',runId,'--repo',repo,'--name',name,'--dir',dest]);
 return JSON.parse(await readFile(join(dest,'cd-state.json'),'utf8'));
}
function publicEnv(env){const clean={...env};for(const key of ['CLOUDFLARE_API_TOKEN','CLOUDFLARE_ACCOUNT_ID','GH_TOKEN','GITHUB_TOKEN'])delete clean[key];return clean;}
export async function mainCLI(action,env=process.env){
 if(action==='check-pr'){const event=JSON.parse(await readFile(env.GITHUB_EVENT_PATH,'utf8')),info=validatePR(event),version=JSON.parse(await readFile(join(projectRoot,'prototype/package.json'),'utf8')).version;
  if(info.version!==version)throw new Error('Release PR version does not match package version');console.log(`Validated ${info.kind} PR into version ${info.version}`);return;}
 if(action!=='execute')throw new Error('Usage: release-cd.js check-pr | execute');
 if(env.ENABLE_PRODUCTION_CD!=='true')throw new Error('Production CD is disabled');
 if(!env.GH_TOKEN||!env.CLOUDFLARE_API_TOKEN||!env.CLOUDFLARE_ACCOUNT_ID)throw new Error('Enabled production CD requires its environment credentials');
 const repository=env.GITHUB_REPOSITORY;if(!/^[\w.-]+\/[\w.-]+$/.test(repository??''))throw new Error('Invalid repository context');
 const event=JSON.parse(await readFile(env.GITHUB_EVENT_PATH,'utf8')),pr=event.pull_request,packageVersion=JSON.parse(await readFile(join(projectRoot,'prototype/package.json'),'utf8')).version;
 const api=githubClient(env.GH_TOKEN),checkoutSHA=(await runCommand('git',['rev-parse','HEAD'],{cwd:projectRoot,env:publicEnv(env)})).trim();
 validateCD({enabled:env.ENABLE_PRODUCTION_CD,event,eventName:env.GITHUB_EVENT_NAME,repository,checkoutSHA,packageVersion,mainSHA:checkoutSHA});
 const mainSHA=(await api(`/repos/${repository}/git/ref/heads/main`)).object.sha,version=pr?.head?.ref?.slice(8);
 if(!versionPattern.test(version??''))throw new Error('Invalid release version');
 const tagSHA=await readTag(api,repository,version),release=await api(`/repos/${repository}/releases/tags/${version}`,{optional404:true});
 const latestRelease=await api(`/repos/${repository}/releases/latest`,{optional404:true});
 const context=validateCD({enabled:env.ENABLE_PRODUCTION_CD,event,eventName:env.GITHUB_EVENT_NAME,repository,checkoutSHA,packageVersion,mainSHA,tagSHA,release,latestRelease});
 if(context.alreadyReleased){const result={status:'already-released',version:context.version,sha:context.sha};await saveJSON(join(projectRoot,'prototype/.cache/release/cd-outcome.json'),result);console.log(`CD outcome: ${result.status} ${result.version} ${result.sha}`);return result;}
 let checkpoint=await restoreCheckpoint(api,repository,env.GITHUB_RUN_ID,context.sha);
 if(release?.draft){const record=JSON.parse(release.body.match(/<!-- silverball-release:(.*?) -->/)[1]);checkpoint=checkpoint??record;}
 const getDeploymentResponse=async()=>{const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID)}/workers/scripts/${targetName}/deployments`,{headers:{authorization:`Bearer ${env.CLOUDFLARE_API_TOKEN}`},signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Cloudflare deployment check failed (${response.status})`);return response.json();};
 const clean=publicEnv(env),cleanRun=(command,args,options)=>runCommand(command,args,{...options,env:publicEnv(options?.env??clean)});
 const result=await executeCD(context,{
  checkpoint,
  prepare:issues=>prepareRelease(projectRoot,{issues,run:cleanRun,preview:root=>import('./release-workflow.js').then(m=>m.startPreview(root,{env:clean}))}),
  refreshMain:async()=>(await api(`/repos/${repository}/git/ref/heads/main`)).object.sha,
  getCurrentDeployment:async()=>deploymentSnapshot(await getDeploymentResponse()),
  generateNotes:async c=>(await api(`/repos/${repository}/releases/generate-notes`,{method:'POST',body:{tag_name:c.tag,target_commitish:c.sha}})).body,
  deploy:async()=>{let output='';await publishRelease(projectRoot,{confirmTarget:targetName,run:async(command,args,options)=>{const text=await runCommand(command,args,{...options,env:{...clean,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID:env.CLOUDFLARE_ACCOUNT_ID}});if(args.includes('deploy'))output=text;return text;}});return output.match(/(?:Current Version ID|Version ID):\s*([a-f0-9-]{36})/i)?.[1];},
  verifyPublic:async(candidate,record)=>{const evidence=verifyCurrentDeployment(await getDeploymentResponse(),record);await verifyPublicAssets(candidate);return evidence;},
  smoke:async()=>{for(const args of [['--prefix','prototype','run','test:release'],['run','test:browser']])await cleanRun('npm',args,{cwd:projectRoot,env:{...clean,REVIEW_URL:productionURL}});await cleanRun(process.execPath,['prototype/tests/feedback.browser.mjs'],{cwd:projectRoot,env:{...clean,REVIEW_URL:productionURL,FEEDBACK_OUTPUT:join(projectRoot,'prototype/.cache/release/production-feedback/')+'/'}});},
  saveCheckpoint:record=>saveJSON(checkpointPath(projectRoot),record),
  createRelease:(c,notes,candidate,record)=>publishGitHubRelease(api,c,notes,candidate,record,{token:env.GH_TOKEN})
 });
 await saveJSON(join(projectRoot,'prototype/.cache/release/cd-outcome.json'),result);console.log(`CD outcome: ${result.status} ${result.version} ${result.sha}`);return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{await mainCLI(process.argv[2]);}catch(error){console.error(`CD failed: ${error.message}`);process.exitCode=1;}}
