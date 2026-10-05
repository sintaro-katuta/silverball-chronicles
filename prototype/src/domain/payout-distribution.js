// Confirmed conditional distribution: sampled only after a jackpot is won.
export const RUSH_PAYOUT_DISTRIBUTION=Object.freeze([
 Object.freeze({amount:500,weight:30}),
 Object.freeze({amount:1500,weight:50}),
 Object.freeze({amount:3000,weight:20})
]);
export function selectPayout(roll,distribution=RUSH_PAYOUT_DISTRIBUTION){
 if(!Number.isFinite(roll)||roll<0||roll>=1)throw new RangeError('Payout roll must be in [0, 1)');
 const total=distribution.reduce((sum,item)=>sum+item.weight,0);
 if(!distribution.length||!Number.isFinite(total)||total<=0||distribution.some(item=>!Number.isFinite(item.weight)||item.weight<0||!Number.isFinite(item.amount)||item.amount<=0))throw new RangeError('Invalid payout distribution');
 let threshold=0;for(const item of distribution){threshold+=item.weight;if(roll*total<threshold)return item.amount;}
 return distribution.at(-1).amount;
}
export function perSpinProbability(withinProbability,spins){
 if(!(withinProbability>0&&withinProbability<1)||!Number.isInteger(spins)||spins<1)throw new RangeError('Invalid RUSH probability or spin count');
 return -Math.expm1(Math.log1p(-withinProbability)/spins);
}
// Payout is earned by actual admissions. No automatic end-of-round top-up.
export function rushPayoutPlan(amount){
 if(amount===500)return {rounds:5,awardPerBall:10};
 if(amount===1500)return {rounds:10,awardPerBall:15};
 if(amount===3000)return {rounds:20,awardPerBall:15};
 throw new RangeError('Unsupported RUSH payout');
}
