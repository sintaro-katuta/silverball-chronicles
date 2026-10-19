import {Preferences} from '@capacitor/preferences';
import {SessionTicketWallet,SESSION_TICKET_KEY} from '../domain/session-ticket-wallet.js';

export function createSessionTicketWallet(){
 return new SessionTicketWallet({
  read:async()=> (await Preferences.get({key:SESSION_TICKET_KEY})).value,
  write:value=>Preferences.set({key:SESSION_TICKET_KEY,value})
 },{lock:work=>navigator.locks?navigator.locks.request(SESSION_TICKET_KEY,work):work()});
}

// Keep two live pages from playing against the same wallet. A reload releases
// the document's lock and can recover its last recorded payout exactly once.
export async function holdTicketPlayLock(){
 if(!navigator.locks)return true;
 return new Promise((resolve,reject)=>{
  navigator.locks.request(`${SESSION_TICKET_KEY}-play`,{ifAvailable:true},async lock=>{
   resolve(!!lock);
   if(lock)await new Promise(release=>window.addEventListener('pagehide',release,{once:true}));
  }).catch(reject);
 });
}
