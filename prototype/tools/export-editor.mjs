import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Physics} from '../src/physics.js';
const output=new URL('../builds/playcanvas-editor/',import.meta.url);
await mkdir(output,{recursive:true});
const states={};
for(const mode of ['normal','rush','bonus']){
 const physics=new Physics();physics.updateGate({rush:mode==='rush',jackpot:mode==='bonus'?{gap:0,count:0}:null});
 states[mode]={gate:physics.gate,rightChucker:physics.rightChucker};
}
await copyFile(new URL('../src/playcanvas/right-unit.mjs',import.meta.url),new URL('right-unit.mjs',output));
for(let course=0;course<3;course++)await copyFile(new URL(`../public/models/course-${course}.glb`,import.meta.url),new URL(`course-${course}.glb`,output));
await writeFile(new URL('right-unit-preview.mjs',output),`import {Script} from 'playcanvas';
import {RightUnit} from './right-unit.mjs';
const states=${JSON.stringify(states)};
// Editor-only poses. Never attach this preview driver to a live game.
export class RightUnitPreview extends Script {
 static scriptName='rightUnitPreview';
 /**
  * Preview pose; no balls, payout or game progression.
  * @attribute
  * @type {'normal' | 'rush' | 'bonus'}
  */
 mode='normal';
 initialize(){this.controller=this.entity.script.get(RightUnit)||this.entity.script.create(RightUnit);}
 update(){this.controller.applyState(states[this.mode]||states.normal);}
}
`);
await copyFile(new URL('../EDITOR_IMPORT.md',import.meta.url),new URL('README.md',output));
const {dependencies}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
await writeFile(new URL('manifest.json',output),JSON.stringify({engine:dependencies.playcanvas,scope:'cabinet assets and right-unit preview; not a playable game export',models:[0,1,2].map(i=>`course-${i}.glb`),scripts:['right-unit.mjs','right-unit-preview.mjs']},null,2));
console.log(`Editor preparation exported to ${fileURLToPath(output)}`);
