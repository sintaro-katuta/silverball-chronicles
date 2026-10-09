import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepareRelease,verifyCandidate,publishRelease,candidatePath,candidateAssets,targetName,parseCommand} from '../tools/release-workflow.js';
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'silverball-release-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'.github/workflows'),{recursive:true});await writeFile(join(root,'.github/workflows/ci.yml'),'{}');
 for(const dir of ['src','public','tests','tools','dist-release'])await mkdir(join(root,'prototype',dir),{recursive:true});
 for(const path of ['package.json','prototype/package.json','prototype/package-lock.json','prototype/vite.config.js','prototype/wrangler.jsonc','prototype/src/game.js','prototype/public/art.png','prototype/tests/game.test.js','prototype/tools/build.js','prototype/dist-release/index.html'])await writeFile(join(root,path),path);
 await writeFile(join(root,'prototype/wrangler.jsonc'),JSON.stringify({name:targetName,workers_dev:true,routes:[{pattern:'silverball-chronicles.sintaro-katuta.com',custom_domain:true},{pattern:'tsukikage.sintaro-katuta.com',custom_domain:true}],assets:{directory:'./dist-release'}}));
 const calls=[];let closes=0;
 const run=async(command,args)=>{calls.push({command,args});return command==='git'?(args[0]==='rev-parse'?'abc123\n':' M prototype/src/game.js\n'):'';};
 const preview=async()=>({url:'http://127.0.0.1:54321',close:async()=>{closes++;}});
 return {root,run,preview,calls,get closes(){return closes;}};
}
test('prepare runs checks, cleans its own preview and issues only a non-public verified manifest',async t=>{
 const f=await fixture(t),m=await prepareRelease(f.root,{run:f.run,preview:f.preview,now:()=> '2026-10-07T00:00:00Z'});
 assert.deepEqual(f.calls.slice(0,4).map(c=>c.args),[['run','test'],['run','build:release'],['--prefix','prototype','run','test:release'],['run','test:browser']]);
 assert.equal(f.closes,1);assert.equal(m.git.dirty,true);assert.equal(m.git.commit,'abc123');assert.equal(m.assets.length,1);assert.equal(m.assets[0].path,'index.html');assert.ok(m.source.files.some(f=>f.path==='prototype/public/art.png'));
 assert.equal((await verifyCandidate(f.root)).createdAt,m.createdAt);assert.ok(!candidatePath(f.root).includes('dist-release'));
 const before=f.calls.length;await publishRelease(f.root,{confirmTarget:targetName,run:f.run});assert.equal(f.calls.length,before+1);assert.equal(f.calls.at(-1).args[1],'deploy');assert.equal(f.calls.at(-1).args.at(-1),candidateAssets(f.root,m.candidateId));assert.ok(!f.calls.at(-1).args.includes('build:release'));
});
for(const stage of ['test','build','preview','browser'])test(`prepare ${stage} failure invalidates old candidate and cleans preview`,async t=>{
 const f=await fixture(t);await mkdir(join(f.root,'prototype/.cache/release'),{recursive:true});await writeFile(candidatePath(f.root),'old candidate');
 const run=async(command,args)=>{if(stage==='test'&&args[1]==='test'||stage==='build'&&args[1]==='build:release'||stage==='browser'&&args.includes('test:release'))throw new Error('fixture check failed');return f.run(command,args);};
 await assert.rejects(prepareRelease(f.root,{run,preview:stage==='preview'?async()=>{throw new Error('preview failed');}:f.preview}));
 await assert.rejects(readFile(candidatePath(f.root)),{code:'ENOENT'});assert.equal(f.closes,stage==='browser'?1:0);assert.ok(!f.calls.some(c=>c.args.includes('deploy')));
});
for(const change of ['modified','added','removed','source','symlink','traversal','missing-manifest'])test(`publish refuses ${change} before calling deploy`,async t=>{
 const f=await fixture(t);const m=await prepareRelease(f.root,{run:f.run,preview:f.preview});const assets=candidateAssets(f.root,m.candidateId);
 if(change==='modified')await writeFile(join(assets,'index.html'),'modified');
 if(change==='added')await writeFile(join(assets,'unreviewed.txt'),'extra');
 if(change==='removed')await rm(join(assets,'index.html'));
 if(change==='source')await writeFile(join(f.root,'prototype/src/game.js'),'new runtime');
 if(change==='symlink')await symlink(join(f.root,'prototype/src/game.js'),join(assets,'linked.js'));
 if(change==='traversal'){const m=JSON.parse(await readFile(candidatePath(f.root),'utf8'));m.assets[0].path='../index.html';await writeFile(candidatePath(f.root),JSON.stringify(m));}
 if(change==='missing-manifest')await rm(candidatePath(f.root));
 let deployed=false;await assert.rejects(publishRelease(f.root,{confirmTarget:targetName,run:async()=>{deployed=true;}}));assert.equal(deployed,false);
});
test('publish without target confirmation and failed verification never deploy',async t=>{
 const f=await fixture(t);await prepareRelease(f.root,{run:f.run,preview:f.preview});let called=false;
 await assert.rejects(publishRelease(f.root,{run:async()=>{called=true;}}),/Manual publish/);assert.equal(called,false);
});
for(const changed of ['source','assets'])test(`prepare refuses ${changed} changed during browser verification`,async t=>{
 const f=await fixture(t);const run=async(command,args)=>{if(args.includes('test:browser'))await writeFile(join(f.root,changed==='source'?'prototype/src/game.js':'prototype/dist-release/index.html'),'concurrent change');return f.run(command,args);};
 await assert.rejects(prepareRelease(f.root,{run,preview:f.preview}),/changed/);assert.equal(f.closes,1);await assert.rejects(readFile(candidatePath(f.root)),{code:'ENOENT'});
});
test('documentation changes do not invalidate runtime/build input fingerprint',async t=>{
 const f=await fixture(t);await prepareRelease(f.root,{run:f.run,preview:f.preview});await mkdir(join(f.root,'docs'));await writeFile(join(f.root,'docs/review.md'),'PM accepted');await verifyCandidate(f.root);
});

test('CLI requires an explicit confirm flag and rejects unknown/missing arguments',()=>{
 for(const args of [['publish',targetName],['publish'],['publish','--confirm-target'],['publish','--unknown',targetName],['publish','--confirm-target',targetName,'--extra','1']])assert.throws(()=>parseCommand(args));
 assert.equal(parseCommand(['publish','--confirm-target',targetName]).confirmTarget,targetName);assert.deepEqual(parseCommand(['prepare','--issues','2,3,4,10']).issues,[2,3,4,10]);
});
test('frozen candidate survives later dist builds; source and config still guard publish',async t=>{
 const f=await fixture(t),m=await prepareRelease(f.root,{run:f.run,preview:f.preview});await writeFile(join(f.root,'prototype/dist-release/index.html'),'later build');await verifyCandidate(f.root);assert.equal(await readFile(join(candidateAssets(f.root,m.candidateId),'index.html'),'utf8'),'prototype/dist-release/index.html');
 const cfg=JSON.parse(await readFile(join(f.root,'prototype/wrangler.jsonc'),'utf8'));cfg.name='another-worker';await writeFile(join(f.root,'prototype/wrangler.jsonc'),JSON.stringify(cfg));let called=false;await assert.rejects(publishRelease(f.root,{confirmTarget:targetName,run:async()=>{called=true;}}));assert.equal(called,false);
});
test('prepare rejects an unexpected actual Worker before running checks',async t=>{
 const f=await fixture(t);await writeFile(join(f.root,'prototype/wrangler.jsonc'),JSON.stringify({name:'wrong-worker'}));await assert.rejects(prepareRelease(f.root,{run:f.run,preview:f.preview}),/Unexpected Worker/);assert.equal(f.calls.length,0);
});
test('publish command failure is propagated without a success result',async t=>{
 const f=await fixture(t);await prepareRelease(f.root,{run:f.run,preview:f.preview});let success=false;await assert.rejects(publishRelease(f.root,{confirmTarget:targetName,run:async()=>{throw new Error('deploy rejected');}}).then(()=>{success=true;}),/deploy rejected/);assert.equal(success,false);
});
