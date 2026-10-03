import {reelState} from './reels.js';

const SYMBOLS=9;
const SPEED=[8.5,9.25,10];
const NAMES=['左','中央','右'];
const modulo=(value,size)=>((value%size)+size)%size;
// The middle repetition has a complete buffer on either side of the viewport.
// Crossing a repetition boundary moves to an identical row, so the wrap is invisible.
export const stripOffset=position=>-(SYMBOLS+modulo(position,SYMBOLS)+.5);
export const centeredDigit=position=>modulo(Math.round(position),SYMBOLS)+1;

export function mountReelDisplay(host){
 const doc=host.ownerDocument;
 const columns=Array.from({length:3},(_,index)=>{
  const window=doc.createElement('span'),strip=doc.createElement('i');
  window.className='reel-window stopped';window.setAttribute('role','img');
  strip.className='reel-strip';strip.setAttribute('aria-hidden','true');
  for(let row=0;row<SYMBOLS*3;row++){
   const digit=row%SYMBOLS+1,symbol=doc.createElement('b');
   symbol.className=`reel-symbol digit-${digit}`;symbol.dataset.digit=String(digit);symbol.textContent=String(digit);strip.append(symbol);
  }
  window.append(strip);
  return {window,strip,index,position:0,lastTime:null,spinning:false,lastValue:null};
 });
 host.replaceChildren(...columns.map(column=>column.window));
 host.classList.add('reel-display');
 let disposed=false;
 function update(game){
  if(disposed||!game)return;
  const state=reelState(game);
  for(const column of columns){
   const {index,window,strip}=column,spinning=!state.stopped[index];
   // Game time is the sole clock: pause, skill selection and result screens freeze
   // the same fractional strip position; no independent CSS animation can drift.
   if(column.lastTime!==null&&column.spinning)column.position-=Math.max(0,game.time-column.lastTime)*SPEED[index];
   if(!spinning)column.position=state.numbers[index]-1;
   else if(column.lastTime===null)column.position=state.numbers[index]-1;
   column.lastTime=game.time;column.spinning=spinning;
   const digit=spinning?centeredDigit(column.position):state.numbers[index];
   window.classList.toggle('spinning',spinning);window.classList.toggle('stopped',!spinning);
   window.dataset.value=String(digit);
   window.dataset.phase=spinning?'spinning':'stopped';
   const label=`${NAMES[index]}図柄 ${spinning?'変動中':digit}`;
   if(window.getAttribute('aria-label')!==label)window.setAttribute('aria-label',label);
   // Row-based offsets remain aligned when responsive/cinematic styles resize.
   const offset=stripOffset(column.position).toFixed(6);
   if(column.lastValue!==offset){strip.style.setProperty('--reel-offset',offset);strip.style.transform=`translate3d(0, calc(${offset} * var(--reel-step, 1.05em)), 0)`;column.lastValue=offset;}
  }
 }
 function dispose(){if(disposed)return;disposed=true;for(const column of columns)column.window.remove();host.classList.remove('reel-display');}
 return {update,dispose};
}
