import{mkdtempSync,cpSync,writeFileSync,readFileSync,mkdirSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import{pathToFileURL,fileURLToPath}from'node:url';import{createHash}from'node:crypto';
const root=fileURLToPath(new URL('..',import.meta.url)),temp=mkdtempSync(join(tmpdir(),'s8-spin-')),out=join(root,'reference-review/s8-ball-spin-20261024');mkdirSync(out,{recursive:true});cpSync(join(root,'src'),join(temp,'src'),{recursive:true});
const patch=(file,a,b)=>{const path=join(temp,'src',file),s=readFileSync(path,'utf8');if(!s.includes(a))throw Error('Patch anchor missing '+file);writeFileSync(path,s.replace(a,b));};
patch('physics/physics.js',"import {resolveVisibleWindmill}","import {applySpinFriction} from '../dev/spin-contact-audit.js';\nimport {resolveVisibleWindmill}");
patch('physics/physics.js','b.vy-=(1+restitution)*v*ny;return -v;','b.vy-=(1+restitution)*v*ny;applySpinFriction(b,nx,ny,-(1+restitution)*v,surfaceVelocity);return -v;');
patch('physics/physics.js','b.vy-=(1+(p.restitution??.46))*v*ny;return true;','b.vy-=(1+(p.restitution??.46))*v*ny;applySpinFriction(b,nx,ny,-(1+(p.restitution??.46))*v);return true;');
patch('physics/solid-polygon-contact.js','export function prepareSolidPolygon','import {applySpinFriction} from \'../dev/spin-contact-audit.js\';\nexport function prepareSolidPolygon');
patch('physics/solid-polygon-contact.js','ball.vy-=(1+collider.restitution)*v*normal.y;return -v;','ball.vy-=(1+collider.restitution)*v*normal.y;applySpinFriction(ball,normal.x,normal.y,-(1+collider.restitution)*v);return -v;');
const{createFrameRouteTrial}=await import(pathToFileURL(join(temp,'src/dev/frame-route-trial-model.js'))),{resetSpinAudit,spinAudit}=await import(pathToFileURL(join(temp,'src/dev/spin-contact-audit.js'))),results=[];
for(const mu of[.08,.2]){
 resetSpinAudit();const m=createFrameRouteTrial('lcd-only'),p=m.physics,spawn=p.spawn.bind(p);p.spawn=(...args)=>{const b=spawn(...args);if(b){b.spinFriction=mu;b.omega=0;}return b;};
 m.flow.start();let stopped=null,peakY=Infinity;const entered=new Set();
 for(let n=0;n<50*120;n++){if(p.metrics.spawned>=20&&stopped===null){m.flow.stop();stopped=p.time;}m.step(1/120);for(const b of p.balls){peakY=Math.min(peakY,b.y);if(b.leftLaunchPlane)entered.add(b.id);}if(stopped!==null&&p.time-stopped>=25)break;}
 const result={mu,radius:p.ballRadius,speedOffset:p.launchSpeedOffset,shots:p.metrics.spawned,entered:entered.size,peakY,valvePasses:p.nonReturnValve.forwardPasses,counts:m.flow.counts,remaining:p.balls.map(b=>({id:b.id,x:b.x,y:b.y,speed:Math.hypot(b.vx,b.vy),omega:b.omega,lastContact:b.lastContact})),audit:{...spinAudit}};results.push(result);console.log(JSON.stringify({mu,shots:result.shots,entered:result.entered,peakY:result.peakY,counts:result.counts,remaining:result.remaining.length,audit:result.audit}));
}
const hashes=Object.fromEntries(['physics/physics.js','physics/solid-polygon-contact.js','dev/spin-contact-audit.js'].map(p=>[p,createHash('sha256').update(readFileSync(join(temp,'src',p))).digest('hex')]));
writeFileSync(join(out,'results.json'),JSON.stringify({scope:'Temporary source copy only; fixed ball and launch; spin friction at stationary contacts, windmill and ball-pair friction unchanged',temp,hashes,results},null,2)+'\n');
for(const file of['physics/physics.js','physics/solid-polygon-contact.js','dev/spin-contact-audit.js']){const target=join(out,'executed-source',file);mkdirSync(join(target,'..'),{recursive:true});cpSync(join(temp,'src',file),target);}
