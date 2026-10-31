import{createRequire}from'node:module';import fs from'node:fs';const require=createRequire(new URL('../../package.json',import.meta.url));const sharp=require('sharp');
export const{data,info}=await sharp(fs.readFileSync(new URL('../pixi-source-layout/reference.jpg',import.meta.url))).removeAlpha().raw().toBuffer({resolveWithObject:true});
export function pixel(x,y){return[...data.subarray((Math.round(y)*info.width+Math.round(x))*3,(Math.round(y)*info.width+Math.round(x))*3+3)];}
export function runs(y,lo,hi,threshold=195){let out=[],start=null;for(let x=lo;x<=hi+1;x++){const rgb=pixel(x,y),on=x<=hi&&Math.max(...rgb)-Math.min(...rgb)<23&&rgb.reduce((a,b)=>a+b)/3<threshold;if(on&&start===null)start=x;if(!on&&start!==null){out.push([start,x-1]);start=null;}}return out;}
if(process.argv[2])for(const y of JSON.parse(process.argv[2]))console.log(y,JSON.stringify(runs(y,Number(process.argv[3]??95),Number(process.argv[4]??190),Number(process.argv[5]??195))));
