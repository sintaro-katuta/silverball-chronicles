import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {RELEASE_ASSETS} from '../tools/release-assets.js';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
const prototypeRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=resolve(process.env.SMOKE_DIAGNOSTIC_TEST_OUTPUT ?? prototypeRoot+'/.cache/release/smoke-diagnostic-verification');
const source=prototypeRoot+'/tests/release.browser.mjs';const original=await readFile(source);const sha=b=>createHash('sha256').update(b).digest('hex');
await mkdir(base,{recursive:true});
const helper=await readFile(prototypeRoot+'/tools/smoke-diagnostics.js');
const results=[];
for(const mode of ['controlled-failure','unwritable-output','normal-success']){
 const success=mode==='normal-success';
 const html=success?`<!doctype html><title>Successful local smoke fixture</title><button data-kind="main">main</button><button id="playMachine">play</button><button id="intro-skip">skip</button><button id="controls-toggle">controls</button><output id="power-label">0.18</output><input id="power-control" min="0.18" max="0.30" step="0.01" value="0.18"><button id="menu">pause</button><button id="resume">resume</button><script>let paused=false;window.__session={snapshot:()=>({paused,pockets:[{kind:'start',w:20}],leftRoutes:{byPower:{'0.18':{tracked:1}}}})};document.querySelector('#menu').onclick=()=>paused=true;document.querySelector('#resume').onclick=()=>paused=false;Promise.all(${JSON.stringify(RELEASE_ASSETS)}.map(p=>fetch('/'+p)));</script>`:`<!doctype html><title>Controlled missing selector</title><body>Controlled failure body without the requested machine selector<script>console.error('controlled console diagnostic');fetch('/missing-resource');</script></body>`;
 const server=createServer((req,res)=>{if(req.url==='/'){res.setHeader('content-type','text/html');res.end(html);}else if(req.url==='/missing-resource'){res.statusCode=404;res.end('controlled missing');}else{res.end('local fixture asset');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
 const output=mode==='unwritable-output'?'/dev/null/not-a-directory':base+'/'+mode;
 const start=Date.now();const processResult=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[source],{cwd:prototypeRoot,env:{...process.env,PLAYWRIGHT_BROWSER:'chromium',REVIEW_URL:`http://127.0.0.1:${port}`,SMOKE_FAILURE_OUTPUT:output},stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('exit',(code,signal)=>resolve({code,signal,stdout,stderr}));});await new Promise(r=>server.close(r));
 await writeFile(base+'/'+mode+'.log',processResult.stdout+processResult.stderr);
 const record={mode,exitCode:processResult.code,elapsedMs:Date.now()-start};
 if(success){assert.equal(processResult.code,0);assert.match(processResult.stdout,/Release passed 390x844/);assert.match(processResult.stdout,/Release passed 1440x900/);assert.equal(processResult.stderr,'');assert.ok(!processResult.stdout.includes('Smoke failure'));record.assertions='Both widths and all original success assertions; no diagnostic stderr/output';}
 else{assert.notEqual(processResult.code,0);assert.match(processResult.stderr,/locator.click: Timeout 30000ms exceeded/);assert.match(processResult.stderr,/controlled console diagnostic/);assert.match(processResult.stderr,/404: http/);assert.match(processResult.stderr,/Controlled failure body/);assert.match(processResult.stderr,/"status":200/);assert.match(processResult.stderr,/"finalURL":"http:\/\/127/);record.assertions='Original locator timeout retained; navigation200, finalURL, consoleerror, HTTP404, title/body recorded';if(mode==='unwritable-output'){assert.match(processResult.stderr,/Smoke failure directory unavailable/);record.assertions+='; unwritable output did not replace original error';}}
 results.push(record);console.log(JSON.stringify(record));
}
assert.equal(sha(await readFile(source)),sha(original));
assert.equal(sha(await readFile(prototypeRoot+'/tools/smoke-diagnostics.js')),sha(helper));
await writeFile(base+'/verification-results.json',JSON.stringify({scope:'Actual release.browser.mjs with implemented diagnostics; loopback synthetic fixtures only; no actual game regression or deployment',sourceUnchanged:true,sourceSHA:sha(original),diagnosticsSHA:sha(helper),results},null,2)+'\n');
