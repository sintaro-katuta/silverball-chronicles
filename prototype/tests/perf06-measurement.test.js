import test from 'node:test';
import assert from 'node:assert/strict';
import {frameSummary,stateBreakdown} from '../tools/perf06-measurement.mjs';
test('nearest-rank p95 and strict slow-frame boundaries are descriptive',()=>{
 const r=frameSummary([10,16,33.4,50,100]);assert.equal(r.p95,100);assert.equal(r.mean,41.88);assert.equal(r.over33_4.count,2);assert.equal(r.over50.count,1);assert.equal(r.over100.count,0);assert.equal(r.count,5);
 assert.equal(frameSummary([]).p95,null);assert.equal(frameSummary([]).over50.ratio,null);assert.throws(()=>frameSummary([NaN]),RangeError);
});
test('state attribution uses the latest sparse marker, preserving PUSH-only subset',()=>{
 const r=stateBreakdown([{at:1,delta:16},{at:210,delta:40},{at:450,delta:20}],[{at:0,mode:'normal',stage:'battle',pushVisible:false},{at:200,mode:'normal',stage:'battle',pushVisible:true},{at:400,mode:'bonus',stage:'bonus',pushVisible:false}]);
 assert.equal(r['normal|battle|push:true'].count,1);assert.equal(r['normal|battle|push:true'].max,40);assert.equal(r['normal|battle|push:false'].count,1);assert.equal(r['bonus|bonus|push:false'].count,1);
});
