import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export async function verifySourceGuards(page,manifest){
 const expected=JSON.stringify(manifest.files),hash=files=>createHash('sha256').update(JSON.stringify(files)).digest('hex');
 for(const variant of ['missing','duplicate','altered']){
  const files=structuredClone(manifest.files);
  if(variant==='missing')files.pop();
  if(variant==='duplicate')files.push({...files[0]});
  if(variant==='altered')files[0].sha256='0'.repeat(64);
  const path='/dev/pin-layout-invalid-inputs.json';
  await page.route('**'+path,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({...manifest,files,sha256:hash(files)})}));
  const outcome=await page.evaluate(async path=>{const {loadCodeEvidence}=await import('/src/dev/pin-layout-source.js');try{await loadCodeEvidence(path);return {rejected:false};}catch(error){return {rejected:true,message:error.message};}},path);
  assert.equal(outcome.rejected,true,`${variant} source evidence must be rejected`);
  assert.ok(outcome.message);await page.unroute('**'+path);
 }
 assert.equal(JSON.stringify(manifest.files),expected);
}
