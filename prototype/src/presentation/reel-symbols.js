// Cosmetic, stable allocation; never consumes the admission/gameplay RNG.
function roll(id,mode,channel){
 let h=(id>>>0)^Math.imul(Math.floor(id/4294967296),0x9e3779b1)^Math.imul(channel+1,0x85ebca6b)^(mode==='rush'?0xc2b2ae35:0x27d4eb2f);
 h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);return ((h^(h>>>16))>>>0)/4294967296;
}
export const nextSymbol=n=>n%9+1;
export function symbolForDraw(id,mode,win){
 const value=roll(id,mode,30),sevenShare=win?.2:.05;
 if(value<sevenShare)return 7;
 const others=[1,2,3,4,5,6,8,9];return others[Math.min(7,Math.floor((value-sevenShare)/(1-sevenShare)*8))];
}
export function presentationReels({drawId,mode,win},route,{fullRotation=false}={}){
 const n=fullRotation?7:symbolForDraw(drawId,mode,win);
 if(route!=='ordinary')return [n,n,win?n:nextSymbol(n)];
 const second=(n-1+1+Math.floor(roll(drawId,mode,31)*8))%9+1;
 return [n,second,1+Math.floor(roll(drawId,mode,32)*9)];
}
