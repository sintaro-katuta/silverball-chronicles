import {readFile,writeFile,mkdir,rename,rm} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sourceFingerprint,inventory,prepareRelease,verifyCandidate,candidatePath,candidateAssets,projectRoot,runCommand,phaseRecorder} from './release-workflow.js';
const unitPath=root=>join(root,'prototype/.cache/release/ci-unit.json');
const browserChecks=['build:release','--prefix prototype run test:release','run test:browser','feedback.browser.mjs'];
export const testInventory=source=>source.files.filter(f=>/^prototype\/tests\/[^/]+\.test\.js$/.test(f.path));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
async function save(path,value){await mkdir(dirname(path),{recursive:true});const temp=path+'.tmp';await writeFile(temp,JSON.stringify(value,null,2)+'\n');await rename(temp,path);}
export function unitSummary(output){const take=name=>Number(output.match(new RegExp(`(?:ℹ|#) ${name} (\\d+)\\b`))?.[1]??NaN);const summary=Object.fromEntries(['tests','pass','fail','cancelled','skipped','todo'].map(n=>[n,take(n)]));if(!Number.isSafeInteger(summary.tests)||summary.tests<1||summary.pass!==summary.tests||['fail','cancelled','skipped','todo'].some(n=>summary[n]!==0))throw new Error('Unit output must report every test passed without skip/cancel');return summary;}
export async function runUnit(root,{run=runCommand}={}){
 await rm(unitPath(root),{force:true});const source=await sourceFingerprint(root),tests=testInventory(source);if(!tests.length)throw new Error('No unit test files');
 const args=['--test',...tests.map(f=>f.path.slice(10))],start=Date.now();
 const phase=await phaseRecorder(root,{kind:'unit'});const output=await phase('test',()=>run(process.execPath,args,{cwd:join(root,'prototype')}));
 const summary=unitSummary(output);if(summary.tests<tests.length)throw new Error('Unit count is below test file inventory');const after=await sourceFingerprint(root);if(!equal(source,after))throw new Error('Unit source inputs changed');
 const commit=(await run('git',['rev-parse','HEAD'],{cwd:root})).trim();
 const evidence={schema:1,status:'unit-verified',commit,source,tests,args,summary,elapsedWallMs:Date.now()-start};await save(unitPath(root),evidence);return evidence;
}
export function validateJoin(unit,candidate,{source,assets,commit}){
 if(unit?.schema!==1||unit.status!=='unit-verified'||candidate?.schema!==1||candidate.status!=='browser-verified')throw new Error('Missing successful unit/browser evidence');
 if(!/^[a-f0-9]{40}$/.test(commit)||unit.commit!==commit||candidate.git?.commit!==commit)throw new Error('CI checkout commits differ');
 if(!equal(unit.source,source)||!equal(candidate.source,source))throw new Error('CI source inventory mismatch');
 const tests=testInventory(source);if(!tests.length||!equal(unit.tests,tests)||!equal(unit.args,['--test',...tests.map(f=>f.path.slice(10))]))throw new Error('Unit test inventory incomplete');
 const s=unit.summary;if(!s||!Number.isSafeInteger(s.tests)||s.tests<tests.length||s.pass!==s.tests||['fail','cancelled','skipped','todo'].some(n=>s[n]!==0))throw new Error('Unit checks incomplete');
 if(!equal(candidate.conditions?.checks,browserChecks)||!equal(candidate.assets,assets))throw new Error('Browser checks or asset inventory mismatch');
 return {...candidate,status:'verified',conditions:{...candidate.conditions,checks:['test',...browserChecks]},unitEvidence:{tests:unit.tests,summary:unit.summary,elapsedWallMs:unit.elapsedWallMs}};
}
export async function aggregate(root,{run=runCommand}={}){
 const path=candidatePath(root);try{
 const unit=JSON.parse(await readFile(unitPath(root),'utf8')),candidate=await verifyCandidate(root,{expectedStatus:'browser-verified'});
 // UUID and manifest validation before using any candidate-controlled path.
 if(!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(candidate.candidateId??''))throw new Error('Invalid candidate ID');
 const source=await sourceFingerprint(root),assets=await inventory(candidateAssets(root,candidate.candidateId)),commit=(await run('git',['rev-parse','HEAD'],{cwd:root})).trim();
 const manifest=validateJoin(unit,candidate,{source,assets,commit});
 await save(path,manifest);await verifyCandidate(root);console.log(`Verified aggregated candidate: ${manifest.candidateId}`);return manifest;
 }catch(error){await rm(path,{force:true});throw error;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const action=process.argv[2];if(process.argv.length!==3)throw new Error('Unexpected CI arguments');if(action==='unit')await runUnit(projectRoot);else if(action==='browser')await prepareRelease(projectRoot,{checksMode:'browser'});else if(action==='aggregate')await aggregate(projectRoot);else throw new Error('Unknown CI stage');}catch(error){console.error(error.message);process.exitCode=1;}
}
