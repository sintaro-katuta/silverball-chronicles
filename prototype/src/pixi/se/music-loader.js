export function createMusicLoader({workerFactory=()=>new Worker(new URL('./music-worker.js',import.meta.url),{type:'module'})}={}){
 let worker=null,serial=0,disposed=false;const pending=new Map();
 const rejectAll=error=>{for(const job of pending.values())job.reject(error);pending.clear();};
 const load=(name,sampleRate)=>{
  if(disposed)return Promise.reject(new Error('Music loader disposed'));
  if(!worker){worker=workerFactory();worker.onmessage=({data})=>{const job=pending.get(data.id);if(!job)return;pending.delete(data.id);data.error?job.reject(new Error(data.error)):job.resolve(data.pcm);};worker.onerror=e=>{rejectAll(new Error(e.message??'Music worker failed'));worker?.terminate();worker=null;};}
  return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});try{worker.postMessage({id,name,sampleRate});}catch(error){pending.delete(id);reject(error);}});
 };
 load.dispose=()=>{disposed=true;worker?.terminate();worker=null;rejectAll(new Error('Music loader disposed'));};return load;
}
