import test from 'node:test';
import assert from 'node:assert/strict';
import {gapSummary,accountingCheck,observationWindows} from '../tools/qa05-measurement.mjs';
test('no-entry window and censored first/last gaps retain their exact meaning',()=>{
 assert.equal(gapSummary([],300).maxGap,300);
 assert.deepEqual(gapSummary([5,295],300),{entries:2,maxGap:290,first:5,last:295,windowSeconds:300});
 assert.equal(gapSummary([80,90],300).maxGap,210);
 assert.ok(Math.abs(gapSummary([.175,250.35],300).maxGap-250.175)<1e-10);
});
test('drain admissions cannot shorten the firing-window gap',()=>{
 assert.deepEqual(gapSummary([301,320],300),gapSummary([],300));
 assert.equal(gapSummary([100,200,301],300).maxGap,100);
 assert.throws(()=>gapSummary([],NaN),RangeError);
});
test('accounting distinguishes prizes, returns and spent shots and exposes mismatches',()=>{
 const ledger={payout:15,returned:2,supply:0,debugAdjustment:0,spent:10};
 assert.deepEqual(accountingCheck(400,407,ledger,10),{expectedStock:407,stockDelta:0,spentMatchesShots:true,reconciled:true});
 assert.equal(accountingCheck(400,408,ledger,10).reconciled,false);
 assert.equal(accountingCheck(400,407,ledger,11).spentMatchesShots,false);
});

test('result-stop censoring separates real physics span from padded requested window',()=>{
 const row={conditions:{seconds:300,drain:45},atStop:{time:200},end:{time:200},session:{phase:'result'},events:[{type:'admission',kind:'start',time:190}]};
 const r=observationWindows(row);assert.equal(r.observedPhysicsFiringSeconds,200);assert.equal(r.firingPaddingSeconds,100);assert.equal(r.observedPhysicsDrainSeconds,0);
 assert.equal(r.observedFiringGap.maxGap,190);assert.equal(r.requestedWindowGapIncludingPadding.windowSeconds,300);
 row.events=[{type:'admission',kind:'start',time:30},{type:'admission',kind:'start',time:100}];
 assert.equal(observationWindows(row).observedFiringGap.maxGap,100);assert.equal(observationWindows(row).requestedWindowGapIncludingPadding.maxGap,200);
});
