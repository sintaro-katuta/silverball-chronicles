const palettes={none:[224,232,237],green:[115,233,151],blue:[119,182,250],red:[245,105,111]};
// A lit sphere: the night side stays transparent, without a disc or rim.
// Fixed terrain keeps surface details consistent between all twelve cues.
const craters=[[-.2,-.38,.21],[.43,.23,.19],[.21,-.08,.12],[-.35,.4,.17],[.51,-.49,.095],[.06,.58,.105],[-.61,-.05,.1]];
export function createMoonCueArt(phase='crescent',color='none'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const c=canvas.getContext('2d'),surface=document.createElement('canvas');surface.width=surface.height=256;
 const sc=surface.getContext('2d'),pixels=sc.createImageData(256,256),rgb=palettes[color];
 const sun=phase==='full'?[0,0,1]:phase==='half'?[1,0,0]:[.82,0,-.572];
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const nx=(x-127.5)/108,ny=(y-127.5)/108,rr=nx*nx+ny*ny;
  if(rr>=1)continue;
  const z=Math.sqrt(1-rr),light=nx*sun[0]+ny*sun[1]+z*sun[2];
  if(light<=0)continue;
  const edge=Math.min(1,(1-Math.sqrt(rr))*108),terminator=Math.min(1,light*90);
  let terrain=1+.035*Math.sin(nx*34+Math.sin(ny*21))+.025*Math.cos(ny*47+nx*13);
  terrain-=.17*Math.exp(-((nx+.18)**2/.13+(ny+.18)**2/.22));
  terrain-=.12*Math.exp(-((nx-.3)**2/.12+(ny-.35)**2/.16));
  for(const [cx,cy,r]of craters){const dx=nx-cx,dy=ny-cy,d=Math.hypot(dx,dy)/r;
   terrain-=.14*Math.exp(-d*d*2.7);
   terrain+=.08*Math.exp(-(((d-.84)/.17)**2))*(dx-dy)/r;
  }
  const shade=(.38+.62*Math.sqrt(light))*terrain,i=(y*256+x)*4;
  for(let k=0;k<3;k++)pixels.data[i+k]=Math.min(255,rgb[k]*shade);
  pixels.data[i+3]=255*edge*terminator;
 }
 sc.putImageData(pixels,0,0);
 // Soft light follows the illuminated silhouette, rather than an outer ring.
 c.shadowColor=`rgba(${rgb.join(',')},0.22)`;c.shadowBlur=7;c.drawImage(surface,0,0);
 return canvas;
}
