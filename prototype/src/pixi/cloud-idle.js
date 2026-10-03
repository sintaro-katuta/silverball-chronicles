import {pixelSurface} from './pixel-primitives.js';

const W=210,H=140;
// Upper silhouette of foreground: clouds stay behind the original artwork.
const skyline=[[0,23],[10,23],[20,26],[32,29],[40,27],[49,19],[57,15],[70,15],[80,17],[87,22],[90,30],[91,53],[94,62],[99,77],[107,74],[111,66],[114,54],[117,64],[122,61],[126,48],[129,41],[133,48],[136,45],[139,31],[143,41],[148,39],[151,27],[153,24],[157,39],[160,37],[164,13],[168,34],[171,34],[175,46],[179,61],[185,65],[191,65],[199,63],[204,54],[207,51],[210,60]];
function skyCeiling(x){
 for(let i=1;i<skyline.length;i++)if(x<skyline[i][0]){
  const a=skyline[i-1],b=skyline[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])-1;
 }
 return 0;
}
export const cloudOffsetAt=time=>Math.floor(Math.max(0,time)/1.5)%(W*2);
function insideMoon(x,y){
 const points=[[158,3],[170,4],[181,11],[188,22],[190,33],[185,43],[175,50],[168,49],[172,42],[178,33],[178,22],[174,14],[166,8],[158,7]];
 let inside=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
export function buildCloudLayer(scene,plate){
 const source=pixelSurface(W,H,c=>c.drawImage(plate.source.resource,0,0,W,H)).getContext('2d').getImageData(0,0,W,H);
 const sky=new Uint8Array(W*H);
 for(let y=0;y<83;y++)for(let x=0;x<W;x++)sky[y*W+x]=y<skyCeiling(x)&&!insideMoon(x,y)?1:0;
 const canvas=pixelSurface(W,H,()=>{}),ctx=canvas.getContext('2d');let last=-1;
 function render(time){
  const offset=cloudOffsetAt(time);if(offset===last)return canvas;last=offset;
  const data=ctx.createImageData(W,H);
  for(let y=0;y<83;y++)for(let x=0;x<W;x++){
   const p=y*W+x;if(!sky[p])continue;
   const wrapped=(x-offset+W*2)%(W*2);
   const sx=wrapped<W?wrapped:W*2-1-wrapped;
   const src=(y*W+sx)*4;
   data.data.set(source.data.subarray(src,src+4),p*4);
  }
  ctx.putImageData(data,0,0);return canvas;
 }
 return {render,sky};
}
