import {Assets} from 'pixi.js';
import {buildHairTipFrames} from '../pixi/hair-tip-idle.js';
import {buildSmoothCloudLayer} from '../pixi/cloud-idle.js';
import {createWaterIdle} from '../pixi/water-idle.js';
export async function inspect(){
 const a=await Promise.all(['moon-castle-v1.png','cloud-sky-v1.png','hair-tip-detail-v1.png','character-static-v1.png','normal-hero-layer-v2.png','normal-background-layer-v1.png'].map(x=>Assets.load('/assets/lcd/'+x)));
 const [scene,sky,atlas,underlay,hero,bg]=a;
 const old=buildHairTipFrames(scene,atlas,underlay),next=buildHairTipFrames(scene,atlas,underlay,{transparent:true});
 const water=createWaterIdle(...a),cloud=buildSmoothCloudLayer(sky,3,scene,{separated:true});
 let removed=0,checks=0,failures=0;
 for(let f=0;f<8;f++){
  const time=f/4,legacy=old.frames[f].getContext('2d').getImageData(0,0,210,140).data,clean=next.frames[f].getContext('2d').getImageData(0,0,210,140).data;
  water.render(time);const actual=water.texture.source.resource.getContext('2d').getImageData(0,0,630,420).data,skyPixels=cloud.render(time).getContext('2d').getImageData(0,0,630,420).data;
  for(let y=24;y<60;y++)for(let x=0;x<28;x++){
   const i=(y*210+x)*4,j=((y*3+1)*630+x*3+1)*4;
   if(legacy[i+3]&&!clean[i+3]&&skyPixels[j+3]===255){removed++; if(x<1||x>26||y<25||y>58||[-1,0,1].some(dy=>[-1,0,1].some(dx=>clean[((y+dy)*210+x+dx)*4+3])))continue; checks++;if([0,1,2].some(k=>Math.abs(actual[j+k]-skyPixels[j+k])>2))failures++;}
  }
 }
 return {removed,checks,failures};
}
