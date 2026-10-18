import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
import {synthesizeS9Se,s9EffectDesign,S9_SE_CATALOG} from '../src/pixi/se/s9-se.js';
import {synthesizeSe as oldSe} from '../reference-review/s9-20261018/audio-v1/baseline-source/original-se.js';
import {buffer} from '../src/pixi/se/s9-synth.js';
const out=path.resolve('prototype/reference-review/s9-20261018/audio-v2'),rate=48000,stage=process.argv.includes('--all')?'all':'representative',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
await fs.mkdir(out,{recursive:true});if(await fs.access(path.join(out,'manifest.json')).then(()=>true).catch(()=>false))throw Error('Refuse to overwrite existing v2 manifest');for(const d of ['music','se','baseline','measurements','scores'])await fs.mkdir(path.join(out,d),{recursive:true});
const metadata={version:2,stage,items:[],files:[],sources:[],acceptance:{synthesis:'pending',numeric:'pending',decode:'pending',browser:'pending',humanListening:'not verified',userAcceptance:'pending',product:'pending'}};
const run=args=>{const r=spawnSync('ffmpeg',['-hide_banner','-nostdin',...args],{encoding:'utf8',maxBuffer:4e6});if(r.status!==0)throw Error(r.stderr);return r;};
function wav(p){const n=p.left.length,b=Buffer.alloc(44+n*8);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(3,20);b.writeUInt16LE(2,22);b.writeUInt32LE(p.sampleRate,24);b.writeUInt32LE(p.sampleRate*8,28);b.writeUInt16LE(8,32);b.writeUInt16LE(32,34);b.write('data',36);b.writeUInt32LE(n*8,40);for(let i=0;i<n;i++){b.writeFloatLE(p.left[i],44+i*8);b.writeFloatLE(p.right[i],48+i*8);}return b;}
async function save(name,p){const dest=path.join(out,name),float=dest+'.float.wav';await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(float,wav(p));run(['-v','error','-i',float,'-c:a','pcm_s24le','-y',dest+'.wav']);await fs.unlink(float);run(['-v','error','-i',dest+'.wav','-c:a','libmp3lame','-b:a','256k','-y',dest+'.mp3']);
 let peak=0,sq=0,mono=0,cl=0,cr=0,cross=0,bad=0;for(let i=0;i<p.left.length;i++){const a=p.left[i],b=p.right[i];if(!Number.isFinite(a)||!Number.isFinite(b))bad++;peak=Math.max(peak,Math.abs(a),Math.abs(b));sq+=a*a+b*b;mono+=(a+b)**2/4;cl+=a*a;cr+=b*b;cross+=a*b;}
 const f=run(['-i',dest+'.wav','-af','apad=pad_dur=1,loudnorm=I=-18:TP=-2:LRA=11:print_format=json','-f','null','-']);const match=f.stderr.match(/\{\s*"input_i"[\s\S]*?\}/g);const loud=match?JSON.parse(match.at(-1)):null;
 const decode=run(['-v','error','-i',dest+'.mp3','-f','null','-']);const n=p.left.length,measurement={duration:n/rate,sampleRate:rate,channels:2,frames:n,pcmPeak:peak,pcmPeakDBFS:20*Math.log10(peak),rms:Math.sqrt(sq/(2*n)),monoLossDB:10*Math.log10(mono/(sq/2)),correlation:cross/Math.sqrt(cl*cr),nonFinite:bad,loudness:loud,mp3DecodeExit:decode.status,loopJoin:p.loopEnd===undefined?null:{left:p.left[0]-p.left.at(-1),right:p.right[0]-p.right.at(-1)},interpretation:'LUFS padded1s for analysis only; files not padded. Peak and decode are technical checks, not listening acceptance.'};if(bad||peak>=1||!loud||Number(loud.input_tp)>-2)throw Error('Technical audio ceiling/finite failure '+name);
 await fs.writeFile(path.join(out,'measurements',name.replaceAll('/','-')+'.json'),JSON.stringify(measurement,null,2));for(const ext of ['wav','mp3']){const b=await fs.readFile(dest+'.'+ext),entry={path:name+'.'+ext,sha256:sha(b),bytes:b.length};metadata.files=metadata.files.filter(x=>x.path!==entry.path);metadata.files.push(entry);}console.log('AUDIO_DONE',name,measurement.duration.toFixed(3),loud.input_i,loud.input_tp);return measurement;}

const names=['spin','stopLeft','stopRight','stopCenter','admission'];
for(const name of names){
 await save('baseline/'+name,name==='admission'?buffer(.16,rate):oldSe(name,0,rate));
 for(let variant=0;variant<4;variant++){
  await save('se/'+name+'-v'+variant,synthesizeS9Se(name,variant,rate));
  await fs.writeFile(path.join(out,'scores',name+'-v'+variant+'.json'),JSON.stringify(s9EffectDesign(name,variant),null,2));
 }
 metadata.items.push({id:'se-'+name,type:'se',label:S9_SE_CATALOG[name].role,path:'se/'+name+'-v0.mp3',baselinePath:'baseline/'+name+'.mp3',baselineLabel:name==='admission'?'専用音なし（無音基準）':'変更前のリールSE',variant:0,...S9_SE_CATALOG[name]});
}
for(const item of metadata.items){
 const measure=async p=>JSON.parse(await fs.readFile(path.join(out,'measurements',p.replace(/\.mp3$/,'').replaceAll('/','-')+'.json')));
 const c=await measure(item.path),b=await measure(item.baselinePath);item.measurement=c;
 if(item.id==='se-admission') item.auditionGain={candidate:1,baseline:1,rule:'No dedicated old sound; silent baseline. No loudness matching against silence.'};
 else {const target=Math.min(Number(c.loudness.input_i),Number(b.loudness.input_i));item.auditionGain={candidate:10**((target-Number(c.loudness.input_i))/20),baseline:10**((target-Number(b.loudness.input_i))/20),targetLUFS:target,rule:'Attenuate louder source only; no PCM alteration.'};}
}
const previous=JSON.parse(await fs.readFile(path.join(out,'old-eight-pcm-before.json'))),preserved={};
for(const key of Object.keys(previous)){const split=key.lastIndexOf('-'),name=key.slice(0,split),v=Number(key.slice(split+1)),p=synthesizeS9Se(name,v,rate);const h=crypto.createHash('sha256').update(Buffer.from(p.left.buffer)).update(Buffer.from(p.right.buffer)).digest('hex');if(h!==previous[key])throw Error('Existing eight PCM changed '+key);preserved[key]=h;}
await fs.writeFile(path.join(out,'old-eight-pcm-proof.json'),JSON.stringify({same:true,rate,variants:preserved},null,2));
const sources=['prototype/src/pixi/se/s9-se.js','prototype/src/pixi/se/s9-synth.js','prototype/src/pixi/se/synth-wave.js','prototype/tools/s9-render-audio-v2.mjs','prototype/reference-review/s9-20261018/audio-v1/baseline-source/original-se.js'];
metadata.sources=await Promise.all(sources.map(async p=>{const b=await fs.readFile(p);return{path:p,sha256:sha(b),bytes:b.length};}));
metadata.acceptance={synthesis:'complete',numeric:'measured; not listening acceptance',decode:'all listed MP3 exit0',humanListening:'not verified',product:'pending runtime/browser QA'};
metadata.silenceBaseline='admission baseline means no dedicated sound, not a reconstructed historical sound';
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(metadata,null,2));console.log('MANIFEST',out);
