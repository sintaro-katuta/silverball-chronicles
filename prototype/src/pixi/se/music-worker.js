import {synthesizeMusic} from './music-score.js';
self.onmessage=({data})=>{try{const pcm=synthesizeMusic(data.name,data.sampleRate);self.postMessage({id:data.id,pcm},[pcm.left.buffer,pcm.right.buffer]);}catch(error){self.postMessage({id:data.id,error:String(error)});}};
