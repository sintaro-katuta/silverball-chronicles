import {sha256} from './pin-layout-model.js';
// Vite-local development only: verify raw file bytes, not transformed modules.
const rawInputs=import.meta.glob(['/src/**/*','/tools/pin-layout-compare.mjs','/tools/pin-layout-inputs.mjs'],{query:'?raw',import:'default'});
export async function loadCodeEvidence(url='/dev/pin-layout-inputs.json'){
 const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error('生成済み試射ソースmanifestが必要です');const manifest=await response.json();
 if(!manifest||!Array.isArray(manifest.files)||!manifest.files.length||! /^[a-f0-9]{64}$/.test(manifest.sha256))throw new Error('Invalid source manifest');
 const seen=new Set();for(const file of manifest.files){if(!/^prototype\/(src\/(?!dev\/)[A-Za-z0-9_./-]+|src\/dev\/pin-layout-(model|measurement)\.js|tools\/pin-layout-(compare|inputs)\.mjs)$/.test(file.path)||file.path.includes('..')||seen.has(file.path)||! /^[a-f0-9]{64}$/.test(file.sha256))throw new Error('Invalid/duplicate source path');seen.add(file.path);}
 if(JSON.stringify([...seen].sort())!==JSON.stringify(Object.keys(rawInputs).filter(p=>!p.startsWith('/src/dev/')||['/src/dev/pin-layout-model.js','/src/dev/pin-layout-measurement.js'].includes(p)).map(p=>'prototype'+p).sort()))throw new Error('Simulation source inventory is incomplete');
 // Node and browser hash the same ordered inventory; no claim about omitted UI/assets.
 for(const file of manifest.files){const rawPath=file.path.slice('prototype'.length),moduleURL=`${rawPath}?raw&source-check=${Date.now()}`;const rawModule=await import(/* @vite-ignore */ moduleURL);const raw=rawModule.default;if(typeof raw!=='string'||await sha256(raw)!==file.sha256)throw new Error(`試射コードがmanifestと異なります: ${file.path}`);}
 if(await sha256(JSON.stringify(manifest.files))!==manifest.sha256)throw new Error('Simulation input SHA mismatch');
 return {codeSHA:manifest.sha256,files:manifest.files.length,scope:manifest.scope,verifiedAt:new Date().toISOString()};
}
