import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();page.on('pageerror',e=>console.error(e));
 await page.goto('http://localhost:5173/tools/bake-models.html');await page.waitForFunction(()=>!!window.bakeBoard);
 await mkdir('public/models',{recursive:true});
 const boards=[];for(let i=0;i<3;i++){
  const {data,metadata}=await page.evaluate(course=>window.bakeBoard(course),i);
  await writeFile(`public/models/course-${i}.glb`,Buffer.from(data,'base64'));
  boards.push(metadata);await writeFile(`public/models/course-${i}.json`,JSON.stringify(metadata));console.log(`Baked course ${i}`);
 }
 await writeFile('src/playcanvas/board-metadata.json',JSON.stringify(boards));
 if(!process.argv.includes('--boards-only')){
 const {data,metrics}=await page.evaluate(()=>window.bakeGlyphs());
 await writeFile('public/models/title-glyphs.glb',Buffer.from(data,'base64'));
 await writeFile('src/playcanvas/title-metrics.json',JSON.stringify(metrics));console.log('Baked title glyphs');
 }
}finally{await browser.close();}
