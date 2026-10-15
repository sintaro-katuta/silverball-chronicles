import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {prepareRelease,candidatePath,candidateAssets,targetName} from '../tools/release-workflow.js';
import {validateJoin,testInventory,unitSummary,runUnit,aggregate} from '../tools/ci-release.js';
const commit='a'.repeat(40),source={sha256:'b'.repeat(64),files:[{path:'prototype/tests/a.test.js',size:3,sha256:'c'.repeat(64)},{path:'prototype/tests/b.test.js',size:4,sha256:'d'.repeat(64)}]},assets=[{path:'index.html',size:1,sha256:'e'.repeat(64)}];
function fixture(){const tests=testInventory(source);return {unit:{schema:1,status:'unit-verified',commit,source:structuredClone(source),tests,args:['--test',...tests.map(f=>f.path.slice(10))],summary:{tests:2,pass:2,fail:0,cancelled:0,skipped:0,todo:0}},candidate:{schema:1,status:'browser-verified',git:{commit},source:structuredClone(source),assets:structuredClone(assets),conditions:{checks:['build:release','--prefix prototype run test:release','run test:browser','feedback.browser.mjs']}},context:{commit,source,assets}};}
test('join promotes only complete same-commit/source/asset coverage',()=>{const f=fixture(),m=validateJoin(f.unit,f.candidate,f.context);assert.equal(m.status,'verified');assert.equal(m.unitEvidence.tests.length,2);assert.equal(f.candidate.status,'browser-verified');assert.deepEqual(m.conditions.checks,['test',...f.candidate.conditions.checks]);});
for(const kind of ['missing-unit','missing-browser','unit-failed','different-commit','source-changed','one-test-only','missing-test-file','missing-check','asset-added','asset-duplicate','asset-modified'])test(`join refuses ${kind}`,()=>{
 const f=structuredClone(fixture());
 if(kind==='missing-unit')f.unit=null;
 if(kind==='missing-browser')f.candidate=null;
 if(kind==='unit-failed')f.unit.status='failed';
 if(kind==='different-commit')f.unit.commit='f'.repeat(40);
 if(kind==='source-changed')f.unit.source.files[0].sha256='f'.repeat(64);
 if(kind==='one-test-only')f.unit.summary.tests=f.unit.summary.pass=1;
 if(kind==='missing-test-file')f.unit.tests.pop();
 if(kind==='missing-check')f.candidate.conditions.checks.pop();
 if(kind==='asset-added')f.candidate.assets.push({path:'extra.js',size:1,sha256:'f'.repeat(64)});
 if(kind==='asset-duplicate')f.candidate.assets.push(f.candidate.assets[0]);
 if(kind==='asset-modified')f.candidate.assets[0].size++;
 assert.throws(()=>validateJoin(f.unit,f.candidate,f.context));
});
test('unit output cannot report successful skipped, failed, cancelled or absent tests',()=>{
 const output='# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0';assert.equal(unitSummary(output).tests,2);
 for(const altered of ['',output.replace('# skipped 0','# skipped 1'),output.replace('# fail 0','# fail 1'),output.replace('# cancelled 0','# cancelled 1'),output.replace('# tests 2','# tests 0')])assert.throws(()=>unitSummary(altered));
});
test('required verify always runs and refuses non-success dependencies before joining',async()=>{
 const workflow=JSON.parse(await readFile(new URL('../../.github/workflows/pr-ci.yml',import.meta.url),'utf8'));
 const job=workflow.jobs.verify;assert.deepEqual(job.needs,['unit','browser']);assert.ok(job.if.startsWith('always()'));const guard=job.steps[0];
 for(const UNIT_RESULT of ['success','failure','cancelled','skipped',''])for(const BROWSER_RESULT of ['success','failure','cancelled','skipped','']){
 const match=guard.run.match(/node -e "(.*)"/);let exit=null;
 Function('process',match[1])({env:{UNIT_RESULT,BROWSER_RESULT},exit:n=>{exit=n;}});assert.equal(exit,UNIT_RESULT==='success'&&BROWSER_RESULT==='success'?null:1);
 }
 assert.ok(job.steps.some(s=>s.run==='node prototype/tools/ci-release.js aggregate'));assert.equal(workflow.permissions.contents,'read');
});

async function sourceFixture(t){const root=await mkdtemp(join(tmpdir(),'silverball-ci-'));t.after(()=>rm(root,{recursive:true,force:true}));
 for(const dir of ['.github/workflows','prototype/src','prototype/public','prototype/tests','prototype/tools'])await mkdir(join(root,dir),{recursive:true});
 for(const f of ['package.json','prototype/package.json','prototype/package-lock.json','prototype/vite.config.js','prototype/wrangler.jsonc','prototype/tests/a.test.js','prototype/tests/b.test.js'])await writeFile(join(root,f),'{}');return root;
}
test('unit stage executes the complete test-file inventory and attests successful counts',async t=>{
 const root=await sourceFixture(t),calls=[];const receipt=await runUnit(root,{run:async(cmd,args)=>{calls.push(args);return cmd==='git'?commit:'# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0';}});
 assert.deepEqual(calls[0],['--test','tests/a.test.js','tests/b.test.js']);assert.equal(receipt.tests.length,2);assert.equal(receipt.summary.pass,2);
});
test('unit stage preserves failed timing but never issues a success receipt',async t=>{
 const root=await sourceFixture(t),original=new Error('failed full test process');await assert.rejects(runUnit(root,{run:async()=>{throw original;}}),error=>error===original);
 await assert.rejects(readFile(join(root,'prototype/.cache/release/ci-unit.json')),e=>e.code==='ENOENT');
 const timing=JSON.parse(await readFile(join(root,'prototype/.cache/release/timings/unit.json'),'utf8'));assert.equal(timing.phases[0].status,'failure');assert.ok(timing.phases[0].elapsedWallMs>=0);
});

async function joinFixture(t){const root=await sourceFixture(t);await mkdir(join(root,'prototype/dist-release'));await writeFile(join(root,'prototype/dist-release/index.html'),'frozen verified bytes');
 await writeFile(join(root,'prototype/wrangler.jsonc'),JSON.stringify({name:targetName,workers_dev:true,routes:[{pattern:'silverball-chronicles.sintaro-katuta.com',custom_domain:true},{pattern:'tsukikage.sintaro-katuta.com',custom_domain:true}],assets:{directory:'./dist-release'}}));
 const run=async(command,args)=>command==='git'?(args[0]==='rev-parse'?commit:''):command===process.execPath?'# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0':'';
 await runUnit(root,{run});const candidate=await prepareRelease(root,{run,preview:async()=>({url:'http://127.0.0.1:1',close:async()=>{}}),checksMode:'browser'});return {root,run,candidate};
}
test('aggregate validates real private candidate bytes before atomic promotion',async t=>{const f=await joinFixture(t),m=await aggregate(f.root,{run:f.run});assert.equal(m.status,'verified');assert.equal(m.unitEvidence.summary.tests,2);assert.equal(await readFile(join(candidateAssets(f.root,m.candidateId),'index.html'),'utf8'),'frozen verified bytes');});
for(const damage of ['missing-unit','traversal','duplicate-asset','invalid-candidate-id','changed-asset','different-source'])test(`aggregate invalidates candidate on ${damage}`,async t=>{
 const f=await joinFixture(t),c=f.candidate;
 if(damage==='missing-unit')await rm(join(f.root,'prototype/.cache/release/ci-unit.json'));
 if(damage==='traversal')c.assets[0].path='../outside';
 if(damage==='duplicate-asset')c.assets.push(c.assets[0]);
 if(damage==='invalid-candidate-id')c.candidateId='../outside';
 if(damage==='changed-asset')await writeFile(join(candidateAssets(f.root,c.candidateId),'index.html'),'other bytes');
 if(damage==='different-source')await writeFile(join(f.root,'prototype/tests/a.test.js'),'modified test input');
 await writeFile(candidatePath(f.root),JSON.stringify(c));await assert.rejects(aggregate(f.root,{run:f.run}));await assert.rejects(readFile(candidatePath(f.root)),e=>e.code==='ENOENT');
});
