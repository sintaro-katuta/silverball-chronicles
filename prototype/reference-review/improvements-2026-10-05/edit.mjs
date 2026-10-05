import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const dir=resolve('reference-review/improvements-2026-10-05'),report=JSON.parse(await readFile(dir+'/check.json','utf8'));
if(!report.complete||report.errors.length)throw Error('Recording verification is incomplete');
const run=args=>{const p=spawnSync('ffmpeg',args,{stdio:'inherit'});if(p.status!==0)throw Error('ffmpeg failed');};
const edit=[];let start=0;
for(const [i,c]of report.clips.entries()){
 const output=dir+'/clip-'+String(i+1).padStart(2,'0')+'.mp4',duration=c.until-c.from;
 run(['-hide_banner','-loglevel','error','-y','-ss',String(c.from),'-i',c.raw,'-t',String(duration),'-vf','fps=30,scale=1280:900','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p',output]);
 edit.push({name:c.name,raw:c.raw,from:c.from,duration,start,output});start+=duration;
}
await writeFile(dir+'/concat.txt',edit.map(c=>"file '"+c.output+"'").join('\n'));
run(['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',dir+'/concat.txt','-c','copy','-movflags','+faststart',dir+'/月影_改善実装_動作確認.mp4']);
await writeFile(dir+'/edit.json',JSON.stringify({speed:1,audio:false,resolution:'1280×900',fps:30,clips:edit,estimatedDuration:start,output:dir+'/月影_改善実装_動作確認.mp4'},null,2));
console.log(JSON.stringify({duration:start,output:dir+'/月影_改善実装_動作確認.mp4'}));
