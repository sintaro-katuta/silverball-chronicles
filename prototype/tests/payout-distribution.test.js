import test from 'node:test';import assert from 'node:assert/strict';
import {selectPayout} from '../src/payout-distribution.js';
test('conditional payout boundaries are 30% / 50% / 20%, independent of win probability',()=>{
 for(const [roll,amount]of [[0,500],[.299999,500],[.3,1500],[.799999,1500],[.8,3000],[.999999,3000]])assert.equal(selectPayout(roll),amount);
 const counts={500:0,1500:0,3000:0};for(let i=0;i<10000;i++)counts[selectPayout((i+.5)/10000)]++;
 assert.deepEqual(counts,{500:3000,1500:5000,3000:2000});
});
test('invalid inputs do not silently award a different prize',()=>{
 for(const r of [-1,1,NaN,Infinity])assert.throws(()=>selectPayout(r),RangeError);
 assert.throws(()=>selectPayout(.5,[]),RangeError);
});
