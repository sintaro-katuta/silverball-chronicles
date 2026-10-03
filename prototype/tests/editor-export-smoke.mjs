import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');
 const result=await page.evaluate(async()=>{
  const [{studio,loadContainer,modelBuffer},{RightUnitPreview}]=await Promise.all([import('/src/playcanvas/runtime.js'),import('/builds/playcanvas-editor/right-unit-preview.mjs')]);
  const host=document.createElement('div');host.style.cssText='width:460px;height:740px';document.body.append(host);
  const view=studio(host),url='/builds/playcanvas-editor/course-0.glb';
  const asset=await loadContainer(view.app,url,await modelBuffer(url)),model=asset.resource.instantiateRenderEntity();view.app.root.addChild(model);
  const root=model.findByName('right-unit');root.addComponent('script');const preview=root.script.create(RightUnitPreview),states=[];
  for(const mode of ['normal','rush','bonus']){
   preview.mode=mode;preview.update();const c=preview.controller;
   states.push({mode,glow:c.glow.enabled,rib:c.rib.enabled,emission:c.materialByName.get('right-chuckerMaterial').emissiveIntensity,gate:c.segments.gate.root.getPosition().toArray()});
  }
  await new Promise(resolve=>{view.app.once('postrender',resolve);view.app.renderNextFrame=true;});
  model.destroy();asset.unload();view.destroy();host.remove();return states;
 });
 assert.deepEqual(result.map(s=>s.glow),[false,false,true]);assert.deepEqual(result.map(s=>s.rib),[true,true,false]);
 assert.deepEqual(result.map(s=>s.emission),[.12,1.8,.12]);assert.notDeepEqual(result[0].gate,result[2].gate);assert.deepEqual(errors,[]);
 console.log('Exported Editor scripts: independent initialization, normal/RUSH/bonus states and teardown passed.',result);
}finally{await browser.close();}
