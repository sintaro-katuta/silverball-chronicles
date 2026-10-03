import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage();await p.goto('http://127.0.0.1:5173/reference-review/pixi-eclipse-mechanism/probe.html');await p.waitForFunction(()=>window.ready);await p.locator('canvas').screenshot({path:'reference-review/pixi-eclipse-mechanism/probe.png'});}finally{await b.close();}
