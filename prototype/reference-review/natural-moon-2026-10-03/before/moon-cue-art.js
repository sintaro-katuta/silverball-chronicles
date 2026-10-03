import {pixelSurface} from './pixel-primitives.js';
const palettes={none:[[223,235,242],[160,183,204]],green:[[113,247,141],[32,143,83]],blue:[[112,188,255],[34,91,181]],red:[[255,103,109],[171,35,66]]};
// Transparent silhouette: the unlit area is a cutout, never a disc or outer ring.
export function createMoonCueArt(phase='crescent',color='none'){
 return pixelSurface(96,96,c=>{
  const [light,dark]=palettes[color];
  for(let y=0;y<96;y++)for(let x=0;x<96;x++){
   const dx=x-47.5,dy=y-47.5,r=42;
   if(dx*dx+dy*dy>r*r)continue;
   if(phase==='half'&&dx<0)continue;
   if(phase==='crescent'&&(dx+15)**2+(dy+7)**2<39**2)continue;
   const crater=((x-59)**2+(y-60)**2<6**2)||((x-65)**2+(y-30)**2<4**2)||((x-35)**2+(y-68)**2<5**2);
   const rgb=crater?dark:light;c.fillStyle=`rgb(${rgb.join(',')})`;c.fillRect(x,y,1,1);
  }
 });
}
