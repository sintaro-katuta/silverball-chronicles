export function pixelSurface(width,height,paint){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;paint(c);return canvas;}
export function painter(c){return {
 poly(points,color){c.fillStyle=color;const ys=points.map(p=>p[1]);for(let y=Math.ceil(Math.min(...ys));y<Math.max(...ys);y++){const xs=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i<xs.length;i+=2)c.fillRect(Math.ceil(xs[i]),y,Math.ceil(xs[i+1])-Math.ceil(xs[i]),1);}},
 rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
 line(x0,y0,x1,y1,color,width=1){x0=Math.round(x0);x1=Math.round(x1);y0=Math.round(y0);y1=Math.round(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;for(;;){c.fillStyle=color;c.fillRect(x0-Math.floor(width/2),y0-Math.floor(width/2),width,width);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}},
 diamond(x,y,r,color){c.fillStyle=color;for(let dy=-r;dy<=r;dy++){const w=r-Math.abs(dy);c.fillRect(x-w,y+dy,w*2+1,1);}}
};}
