import {drawStartingBalls,payoutTickets,STARTING_BALL_AMOUNTS,MAX_WAGER_TICKETS} from './starting-ball-wager.js';

export const SESSION_TICKET_KEY='tsukikage-session-tickets-v1';
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const fresh=()=>({version:1,tickets:0,serial:0,active:null,lastResult:null});
function validate(state){
 if(state?.version!==1||!integer(state.tickets)||!integer(state.serial))throw new Error('Invalid ticket save');
 const a=state.active;
 if(a&&(!integer(a.id)||a.id<1||a.id>state.serial||!integer(a.stake)||a.stake>MAX_WAGER_TICKETS||!STARTING_BALL_AMOUNTS.includes(a.balls)||!['ready','playing'].includes(a.phase)||!integer(a.payout)||(a.phase==='ready'&&a.payout!==0)||(a.stake===0&&a.balls!==400)))throw new Error('Invalid pending session');
 const r=state.lastResult;
 if(r&&(!integer(r.id)||r.id<1||r.id>state.serial||!integer(r.payout)||r.earned!==payoutTickets(r.payout)))throw new Error('Invalid ticket result');
 return state;
}

// Every mutation reads the latest record, and saves the whole transaction before
// returning it. The injected lock serializes tabs as well as this instance.
export class SessionTicketWallet {
 constructor(storage,{lock=work=>work()}={}){this.storage=storage;this.lock=lock;this.queue=Promise.resolve();}
 run(change){
  const operation=this.queue.then(()=>this.lock(async()=>{
   const raw=await this.storage.read();
   const state=raw===null?fresh():validate(JSON.parse(raw));
   const result=change(state);
   validate(state);
   if(raw!==JSON.stringify(state))await this.storage.write(JSON.stringify(state));
   return structuredClone(result);
  }));
  this.queue=operation.catch(()=>{});return operation;
 }
 snapshot(){return this.run(state=>state);}
 begin(stake=0,rng=Math.random){return this.run(state=>{
  if(state.active){if(state.active.phase==='ready')return state.active;throw new Error('A session is already playing');}
  if(!integer(stake)||stake>MAX_WAGER_TICKETS||stake>state.tickets)throw new RangeError('Not enough tickets or invalid stake');
  const balls=drawStartingBalls(stake,rng);
  state.tickets-=stake;state.serial++;
  state.active={id:state.serial,stake,balls,phase:'ready',payout:0};
  return state.active;
 });}
 start(id){return this.run(state=>{
  const a=state.active;
  if(!a||a.id!==id||a.phase!=='ready')throw new Error('No prepared session');
  a.phase='playing';return a;
 });}
 record(id,total){return this.run(state=>{
  const a=state.active;
  if(!a||a.id!==id||a.phase!=='playing')throw new Error('Session is no longer active');
  if(!integer(total)||total<a.payout)throw new RangeError('Payout must be cumulative');
  a.payout=total;return a;
 });}
 settle(state,total){
  const a=state.active;
  if(!integer(total)||total<a.payout)throw new RangeError('Payout must be cumulative');
  const earned=payoutTickets(total);
  if(!integer(state.tickets+earned))throw new RangeError('Ticket balance is outside supported numeric precision');
  state.tickets+=earned;state.lastResult={id:a.id,payout:total,earned};state.active=null;
  return {...state.lastResult,balance:state.tickets};
 }
 finish(id,total){return this.run(state=>{
  if(state.lastResult?.id===id)return {...state.lastResult,balance:state.tickets};
  if(!state.active||state.active.id!==id||state.active.phase!=='playing')throw new Error('No playing session');
  return this.settle(state,total);
 });}
 recover(){return this.run(state=>state.active?.phase==='playing'?this.settle(state,state.active.payout):null);}
}
