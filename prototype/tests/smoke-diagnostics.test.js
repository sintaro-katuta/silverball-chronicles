import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {captureSmokeFailure, closeSmokeResource} from '../tools/smoke-diagnostics.js';
const detail = {viewport:{width:390,height:844},navigation:{status:403,url:'http://local.test/'},errors:['403: http://local.test/'],consoleErrors:['boot failed'],error:new Error('original locator failure')};
const page = () => ({url:()=> 'http://local.test/final',evaluate:async()=>({title:'failure',body:'no machine'}),content:async()=>'<html>failure</html>',screenshot:async()=>Buffer.from('image')});
test('failure evidence keeps navigation, errors and independent document/HTML/screenshot captures',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'smoke-evidence-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const evidence=await captureSmokeFailure(page(),detail,{directory,log:()=>{}}),files=await readdir(directory);
 assert.equal(files.length,3);assert.equal(evidence.originalError,detail.error.message);assert.equal(evidence.finalURL,'http://local.test/final');assert.deepEqual(evidence.navigation,detail.navigation);assert.deepEqual(evidence.errors,detail.errors);assert.deepEqual(evidence.consoleErrors,detail.consoleErrors);
 assert.deepEqual(JSON.parse(await readFile(join(directory,files.find(f=>f.endsWith('.json'))),'utf8')),evidence);
});
test('unavailable output and closed page remain diagnostic failures, not replacement errors',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'smoke-unwritable-'));t.after(()=>rm(directory,{recursive:true,force:true}));await writeFile(join(directory,'file'),'not a directory');
 const broken=page();for(const key of ['evaluate','content','screenshot'])broken[key]=async()=>{throw new Error('page closed');};const logs=[];
 const evidence=await captureSmokeFailure(broken,detail,{directory:join(directory,'file','child'),log:(...args)=>logs.push(args.join(' '))});assert.equal(evidence.originalError,detail.error.message);assert.equal(evidence.diagnosticErrors.length,3);assert.equal(evidence.documentState,null);assert.ok(logs.some(l=>l.includes('directory unavailable')));
});
test('cleanup retains the original error object, while cleanup-only failure remains a failure',async()=>{
 const closeError=new Error('close failed'),resource={close:async()=>{throw closeError;}},logs=[];
 await assert.rejects(async()=>{try{throw detail.error;}finally{await closeSmokeResource(resource,detail.error,(...args)=>logs.push(args));}},error=>error===detail.error);
 assert.equal(logs.length,1);await assert.rejects(closeSmokeResource(resource,null),error=>error===closeError);
});
