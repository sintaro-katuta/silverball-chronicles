import test from 'node:test';
import assert from 'node:assert/strict';
import {shotSettings,shotStatus,shotInterval} from '../src/legacy/shot-control.js';
test('manual and automatic shooting use the same power/angle parameters',()=>{
 const physics={normalPower:.57,bonusPower:1};
 assert.deepEqual(shotSettings({},physics),{power:.57,angle:0});
 assert.deepEqual(shotSettings({jackpot:{}},physics),{power:1,angle:0});
 assert.deepEqual(shotSettings({jackpot:{}},physics,{manual:true,power:.3,angle:-.2}),{power:.3,angle:-.2});
});
test('normal right-fire warning follows observed balls instead of a power threshold',()=>{
 const physics={flowSummary:()=>({left:0,right:0})};
 assert.equal(shotStatus({time:0},physics,{power:1}).warning,false);
 physics.flowSummary=()=>({left:0,right:2});
 assert.equal(shotStatus({time:3},physics,{power:.4}).warning,true);
 physics.flowSummary=()=>({left:3,right:0});
 assert.equal(shotStatus({time:7},physics,{power:1}).warning,false);
});
test('jackpot assist shows closed round waiting without normal warning',()=>{
 const physics={flowSummary:()=>({left:0,right:3}),shouldWaitToFire:()=>true};
 assert.equal(shotStatus({jackpot:{},time:0},physics,{power:1}).waiting,true);
 const status=shotStatus({jackpot:{challenge:{}},time:0},physics,{power:1});
 assert.equal(status.warning,false);assert.match(status.label,/ラウンド待機/);
});

test('RUSH auto maintains right shooting and waits for accepted spins without normal warning',()=>{
 const physics={normalPower:.57,bonusPower:1,flowSummary:()=>({left:0,right:2}),shouldWaitToFire:()=>true};
 const g={rush:{remaining:20},rightPlay:true,time:5};
 assert.equal(shotSettings(g,physics).power,1);
 const status=shotStatus(g,physics,{power:1});assert.equal(status.warning,false);assert.equal(status.waiting,true);assert.match(status.label,/RUSH/);
 assert.equal(shotStatus(g,physics,{power:1},{assisted:false}).waiting,false);
});

test('extreme rates work in normal/manual play while assisted right play spaces shots',()=>{
 assert.equal(shotInterval({fireRate:6000,rightPlay:false}),.01);
 assert.equal(shotInterval({fireRate:6000,rightPlay:true},{manual:true}),.01);
 assert.equal(shotInterval({fireRate:6000,rightPlay:true}),.1);
 assert.equal(shotInterval({fireRate:100,rightPlay:true}),.6);
});
