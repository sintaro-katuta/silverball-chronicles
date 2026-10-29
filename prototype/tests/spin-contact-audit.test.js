import test from'node:test';import assert from'node:assert/strict';import{applySpinFriction,spinEnergy}from'../src/dev/spin-contact-audit.js';
test('static friction contact cannot add linear plus angular energy across speeds, spins and normals',()=>{
 for(const mu of[.08,.2])for(const speed of[-400,-10,0,10,400])for(const omega of[-100,0,100])for(const angle of[0,.45,1.5,2.9]){
  const b={vx:speed,vy:speed/3,r:3,omega,spinFriction:mu},E=spinEnergy(b),impulse=70,j=applySpinFriction(b,Math.cos(angle),Math.sin(angle),impulse);
  assert.ok(Math.abs(j)<=mu*impulse+1e-9);assert.ok(spinEnergy(b)<=E+1e-8);
 }
});
test('without friction or supporting normal impulse, a ball gets no invented spin or translation',()=>{
 for(const b of[{vx:100,vy:20,r:3},{vx:100,vy:20,r:3,spinFriction:0},{vx:100,vy:20,r:3,spinFriction:.2}]){const before={...b};applySpinFriction(b,0,-1,b.spinFriction===.2?0:100);assert.deepEqual(b,before);}
});
test('unclamped contact removes slip by exchanging real linear and angular momentum',()=>{
 const b={vx:10,vy:0,r:3,omega:0,spinFriction:1};applySpinFriction(b,0,-1,100);assert.ok(Math.abs(b.vx-b.omega*b.r)<1e-10);assert.ok(b.vx>0&&b.vx<10);assert.ok(b.omega>0);
});
