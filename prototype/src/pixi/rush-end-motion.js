export const RUSH_END_SECONDS=4.2;
export function rushEndPose(time,endedAt,busy=false){
 const age=Number.isFinite(endedAt)?time-endedAt:-1;
 const visible=!busy&&age>=0&&age<RUSH_END_SECONDS;
 return {visible,age,showResult:visible&&age>=.8,
  dim:Math.max(0,Math.min(1,(age-.25)/.65)),
  alpha:Math.max(0,Math.min(1,(age-.8)/.3,(RUSH_END_SECONDS-age)/.35)),y:0};
}
