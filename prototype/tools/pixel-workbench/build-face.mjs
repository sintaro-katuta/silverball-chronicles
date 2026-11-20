import {writeFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
const w=120,h=80,palette=['#07112b','#101d40','#192b55','#29417a','#3b5594','#536ea4','#7588ba','#9eadd3','#c3ccea','#e3e8f8','#fff2d1','#e6b53e','#b47722','#714516','#153989','#1d58b5','#3183d0','#10162a','#f8c7a1','#e8a17b','#bc715e','#ffffff','#42a8ee','#203c76','#ffa84b'];
const pixels=Array(w*h).fill(0);
const set=(x,y,c)=>{if(x>=0&&y>=0&&x<w&&y<h)pixels[y*w+x]=c};
function poly(points,c){let minX=Math.max(0,Math.floor(Math.min(...points.map(p=>p[0])))),maxX=Math.min(w-1,Math.ceil(Math.max(...points.map(p=>p[0])))),minY=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))),maxY=Math.min(h-1,Math.ceil(Math.max(...points.map(p=>p[1]))));for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){let [xi,yi]=points[i],[xj,yj]=points[j];if(((yi>y+.5)!=(yj>y+.5))&&x+.5<(xj-xi)*(y+.5-yi)/(yj-yi)+xi)inside=!inside}if(inside)set(x,y,c)}}
const rect=(x,y,ww,hh,c)=>{for(let j=y;j<y+hh;j++)for(let i=x;i<x+ww;i++)set(i,j,c)};
// A quiet night behind the heroine; the same cell grid covers sky, architecture and figure.
rect(0,0,120,80,1);rect(0,38,120,42,2);poly([[82,37],[84,27],[87,27],[87,19],[90,9],[93,19],[93,28],[96,28],[96,21],[99,14],[102,21],[102,32],[106,32],[106,25],[109,16],[112,25],[112,38]],0);rect(85,36,35,7,0);for(const [x,y] of [[89,25],[91,20],[98,25],[99,29],[108,27],[110,31],[115,34]])rect(x,y,2,3,11);
// Stylised crescent is intentionally placed behind all other foreground elements.
for(let y=4;y<21;y++)for(let x=99;x<116;x++){let d=(x-107)**2+(y-12)**2,cut=(x-110)**2+(y-9)**2;if(d<65&&cut>58)set(x,y,10)}
// Rear cape, hair masses and long locks; no curves or anti-aliased shapes.
poly([[35,38],[54,32],[75,48],[71,80],[0,80],[0,59],[17,50]],17);poly([[29,42],[57,37],[65,59],[61,80],[0,80],[0,64]],14);poly([[26,48],[53,40],[58,60],[48,80],[5,80]],15);poly([[5,70],[42,50],[28,78],[11,80]],3);
poly([[49,5],[70,4],[79,11],[82,24],[78,39],[65,45],[44,39],[32,29],[15,25],[1,17],[0,12],[12,16],[28,17],[36,11]],17);
poly([[49,6],[68,6],[76,12],[79,24],[75,37],[63,42],[43,37],[31,28],[14,23],[0,15],[0,11],[17,15],[32,15],[39,9]],5);
poly([[47,7],[65,7],[73,12],[77,20],[74,27],[65,24],[55,21],[43,20],[29,21],[13,18],[0,12],[0,9],[18,13],[33,12],[40,8]],7);
poly([[41,12],[26,19],[11,19],[0,14],[0,17],[11,23],[27,24],[43,19],[58,15],[64,10],[57,7]],8);
poly([[42,21],[30,28],[13,30],[0,25],[0,30],[12,35],[27,34],[43,27],[58,21]],6);
poly([[37,26],[24,37],[11,40],[0,37],[0,41],[11,45],[27,41],[42,31]],8);
poly([[37,32],[25,45],[10,49],[0,47],[0,52],[12,55],[29,49],[45,37]],4);
poly([[36,36],[26,50],[12,56],[0,55],[0,59],[15,62],[31,55],[46,41]],7);
// Face silhouette and neck; staircase only at the chosen resolution.
poly([[56,15],[68,14],[75,19],[76,31],[72,38],[66,43],[58,41],[51,35],[48,26],[50,19]],20);
poly([[55,16],[67,15],[74,19],[74,30],[70,37],[66,40],[59,38],[53,34],[50,26],[51,19]],18);
poly([[51,27],[54,31],[56,35],[60,38],[63,39],[58,38],[53,35],[50,29]],19);
poly([[60,39],[67,39],[70,46],[57,47]],19);
// Fringe over forehead, keeping eyes clearly exposed.
poly([[49,10],[67,9],[75,15],[76,22],[72,21],[69,18],[65,19],[61,17],[57,20],[53,21],[50,25],[47,21]],6);
poly([[49,10],[63,9],[71,12],[73,15],[67,15],[62,13],[58,16],[54,16],[49,20],[46,19]],8);
poly([[51,11],[61,10],[65,11],[60,13],[55,14],[50,17],[47,17]],9);
// Brows and angular blue eyes deliberately share the grid of the cheeks and hair.
poly([[52,22],[58,21],[61,23],[60,24],[56,23],[52,24]],17);poly([[67,22],[72,21],[74,22],[74,24],[71,23],[68,24]],17);
poly([[53,24],[60,24],[60,27],[58,29],[55,28],[53,26]],17);poly([[54,24],[59,25],[59,27],[57,28],[55,27]],21);rect(56,24,2,4,16);rect(57,25,1,2,17);set(56,25,21);
poly([[67,24],[73,24],[73,27],[71,29],[68,28],[67,26]],17);poly([[68,25],[72,25],[72,27],[70,28],[68,27]],21);rect(69,25,2,3,16);set(70,26,17);set(69,25,21);
set(65,30,19);set(64,31,20);rect(63,35,3,1,20);
// Gold flower ornament: eight block petals surrounding a blue gem.
poly([[43,10],[46,10],[46,6],[49,6],[49,10],[52,8],[54,10],[51,13],[54,15],[52,17],[49,15],[49,19],[46,19],[46,15],[43,17],[41,15],[44,12],[41,11]],12);
rect(46,7,2,4,11);rect(42,11,4,2,11);rect(49,9,3,2,11);rect(49,14,3,2,11);rect(46,14,2,4,11);rect(44,12,6,3,17);rect(46,12,3,3,16);set(47,12,21);
// Shoulder and armor in foreground with gold trim.
poly([[57,41],[69,40],[81,43],[91,52],[95,66],[96,80],[35,80],[36,57],[43,47]],17);
poly([[56,43],[69,42],[79,45],[87,53],[91,66],[91,80],[39,80],[40,59],[46,49]],2);
poly([[48,48],[59,43],[72,44],[82,50],[87,56],[84,58],[76,51],[66,48],[55,48],[47,52]],11);
poly([[46,53],[56,49],[67,49],[77,53],[82,59],[81,68],[72,65],[62,64],[52,68],[43,66]],3);
poly([[44,67],[53,63],[64,61],[74,63],[83,68],[84,71],[72,67],[63,66],[53,69],[44,72]],11);
poly([[43,73],[53,70],[65,69],[76,71],[84,75],[85,80],[42,80]],2);
// Shoulder crest.
poly([[62,52],[64,52],[64,54],[67,54],[67,56],[64,56],[64,59],[62,59],[62,56],[59,56],[59,54],[62,54]],11);
const project={version:1,width:w,height:h,palette,pixels,description:'歩み・顔アップの手作業格子試作。セル単位の塗りで構成。'};
await writeFile('prototype/reference-review/s10-pixel-grid/step-face-grid-v1.json',JSON.stringify(project));
// Encode a standards-compliant RGBA PNG without smoothing; all artwork exists at the grid size.
const rgba=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){let row=y*(w*4+1);rgba[row]=0;for(let x=0;x<w;x++){let rgb=palette[pixels[y*w+x]].slice(1);let i=row+1+x*4;rgba[i]=parseInt(rgb.slice(0,2),16);rgba[i+1]=parseInt(rgb.slice(2,4),16);rgba[i+2]=parseInt(rgb.slice(4,6),16);rgba[i+3]=255}}
function crc(buf){let c=0xffffffff;for(let b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}function chunk(t,b){const ty=Buffer.from(t),out=Buffer.alloc(12+b.length);out.writeUInt32BE(b.length,0);ty.copy(out,4);b.copy(out,8);out.writeUInt32BE(crc(Buffer.concat([ty,b])),8+b.length);return out}const head=Buffer.alloc(13);head.writeUInt32BE(w,0);head.writeUInt32BE(h,4);head[8]=8;head[9]=6;await writeFile('prototype/reference-review/s10-pixel-grid/step-face-grid-v1.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(rgba)),chunk('IEND',Buffer.alloc(0))]));console.log(`wrote ${w}×${h}, ${palette.length} palette colors`);
