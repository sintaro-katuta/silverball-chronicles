// Shared source-diagram coordinates keep the drawn hilt and rotation pivot identical.
export const SWORD_HILT=Object.freeze([426,324]);
export const SWORD_BLADE_TIP=193;
export const SWORD_GRIP_CENTER=10;
// Visible moon radius is 21 board units. Its far edge sits within the blade's orbit.
export const SWORD_MOON_CENTER=Object.freeze([558,296]);
export function swordSourcePoint(u,v){return [SWORD_HILT[0]+u*Math.cos(Math.PI/6)+(v-SWORD_GRIP_CENTER)*.5,SWORD_HILT[1]+u*.5-(v-SWORD_GRIP_CENTER)*Math.cos(Math.PI/6)];}
