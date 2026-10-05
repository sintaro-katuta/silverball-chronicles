import {SCENES,PATTERNS,imagePath} from '../presentation/reach-scenes.js';

export const GUARDIAN_ART='/moon-guardian-pixel-v2.png';

export const GAME_IMAGES=Object.freeze([...new Set([
 GUARDIAN_ART,'/eclipse-battle.png',
 ...SCENES.flatMap(scene=>PATTERNS.map(pattern=>imagePath(scene.id,pattern.id)))
])]);
const images=new Map();
export function loadedImage(url){
 const image=images.get(url);
 if(!image)throw new Error(`Image is not ready: ${url}`);
 return image;
}
function decodeImage(url,signal){
 return new Promise((resolve,reject)=>{
  const image=new Image();let settled=false;
  const finish=(error,value=image)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);image.onload=image.onerror=null;if(error){image.src='';reject(error);}else resolve(value);};
  const abort=()=>finish(new DOMException('Loading cancelled','AbortError'));
  const timer=setTimeout(()=>finish(new Error(`Image timeout: ${url}`)),60000);
  image.onload=async()=>{try{await image.decode();finish(null,image);}catch(error){finish(error);}};
  image.onerror=()=>finish(new Error(`Image failed: ${url}`));
  signal?.addEventListener('abort',abort,{once:true});
  if(signal?.aborted){abort();return;}
  image.src=url;
 });
}
export async function prepareGameAssets({signal,onProgress=()=>{}}={}){
 let next=0,complete=0;const total=GAME_IMAGES.length;
 const report=()=>onProgress({complete,total});report();
 async function worker(){
  while(next<total){
   signal?.throwIfAborted();const url=GAME_IMAGES[next++];
   if(!images.has(url))images.set(url,await decodeImage(url,signal));
   signal?.throwIfAborted();complete++;report();
  }
 }
 // Bounded decoding avoids processing all full-resolution images at once.
 await Promise.all(Array.from({length:3},worker));
}
