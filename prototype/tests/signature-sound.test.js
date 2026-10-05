import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {MOON_SIGNATURE,synthesizeSignature} from '../src/pixi/se/signature-sound.js';
import {SE_CATALOG,synthesizeSe} from '../src/pixi/se/original-se.js';
import {reachAudioCues} from '../src/pixi/se/presentation-cues.js';
test('a shared recognition rhythm keeps distinct sound arrangements for all four variants',()=>{
 assert.deepEqual(MOON_SIGNATURE.ratchetAt,[.074,.124,.168,.204,.233]);assert.equal(MOON_SIGNATURE.releaseAt,.312);
 const hashes=new Set();for(const mode of MOON_SIGNATURE.reservedFor)for(let variant=0;variant<4;variant++){
  const pcm=synthesizeSignature({mode,variant,sampleRate:16000});const hash=createHash('sha256').update(new Uint8Array(pcm.left.buffer)).digest('hex');assert.ok(!hashes.has(hash));hashes.add(hash);
  for(const [at,end] of [[0,.07],[.075,.28],[.32,.48],[.5,1.2]]){let energy=0;for(const x of pcm.left.slice(Math.floor(at*16000),Math.floor(end*16000)))energy+=x*x;assert.ok(energy>.05,mode+':'+variant+':'+at);}
 }
});
test('the signature is used by win/RUSH win only, never ordinary contacts or losing reaches',()=>{
 const names=Object.entries(SE_CATALOG).filter(([,s])=>s.kind==='victory').map(([n])=>n);assert.deepEqual(names,MOON_SIGNATURE.reservedFor);
 for(const win of [true,false]){const p={longReach:true,displayRoute:'battle',presentationMode:'normal',reachVariant:'pressure',reachEnding:'standard',win};const cues=reachAudioCues(p);assert.ok(!cues.some(c=>MOON_SIGNATURE.reservedFor.includes(c.name)&&c.at<51.7));if(!win)assert.ok(!cues.some(c=>MOON_SIGNATURE.reservedFor.includes(c.name)));}
 assert.throws(()=>synthesizeSignature({mode:'loss'}),RangeError);
});
test('the catalog uses the dedicated signature rather than a generic victory chord',()=>{
 const rendered=synthesizeSe('win',2,16000),dedicated=synthesizeSignature({mode:'win',variant:2,sampleRate:16000,duration:SE_CATALOG.win.duration,level:SE_CATALOG.win.level});assert.deepEqual(rendered.left,dedicated.left);
});
