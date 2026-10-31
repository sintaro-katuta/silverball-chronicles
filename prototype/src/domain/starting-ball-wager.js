export const BASE_STARTING_BALLS=400;
export const MAX_WAGER_TICKETS=50;
export const STARTING_BALL_AMOUNTS=Object.freeze([400,500,600,800,1000]);
const LOW=[50,25,15,7,3],HIGH=[10,30,25,20,15];
const TOTAL_WEIGHT=4900;

export function startingBallDistribution(tickets){
 if(!Number.isInteger(tickets)||tickets<1||tickets>MAX_WAGER_TICKETS)throw new RangeError('Choose 1–50 tickets');
 return STARTING_BALL_AMOUNTS.map((balls,i)=>{
  const weight=LOW[i]*49+(HIGH[i]-LOW[i])*(tickets-1);
  return {balls,weight,probability:weight/TOTAL_WEIGHT};
 });
}

export function drawStartingBalls(tickets,rng=Math.random){
 if(tickets===0)return BASE_STARTING_BALLS;
 const distribution=startingBallDistribution(tickets),roll=rng();
 if(!Number.isFinite(roll)||roll<0||roll>=1)throw new RangeError('Invalid wager roll');
 let weight=0;
 for(const outcome of distribution){weight+=outcome.weight;if(roll<weight/TOTAL_WEIGHT)return outcome.balls;}
 return distribution.at(-1).balls;
}

export function payoutTickets(total){
 if(!Number.isFinite(total)||total<0)throw new RangeError('Invalid cumulative payout');
 return total===0?0:Math.max(1,Math.floor(Math.sqrt(total/100)));
}
