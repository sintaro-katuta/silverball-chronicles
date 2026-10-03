import {chromium} from '@playwright/test';
const pass=process.argv[2],dir='reference-review/pixi-cabinet-three-pass';
const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage({viewport:{width:390,height:844}});await p.goto('http://127.0.0.1:5173/');await p.waitForTimeout(1200);await p.screenshot({path:`${dir}/pass-${pass}.png`});await p.screenshot({path:`${dir}/detail-${pass}.png`,clip:{x:42,y:183,width:140,height:205}});}finally{await b.close();}
