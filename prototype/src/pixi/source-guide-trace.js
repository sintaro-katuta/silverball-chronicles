import {sourcePath} from './source-layout.js';
// Coordinates adopted verbatim from the user export saved 2026-10-24T08:15:52Z.
// Original submission: reference-review/s8-user-guides-20261024/user-layout.json.
// These are picture coordinates,
// not mm or confirmed real-machine depths. Frame bevels are drawn, not extra walls.
export const SOURCE_GUIDE_TRACE_VERSION='2026-10-24-user-081552';
const path=(id,region,role,points,{contact=true,r=.65,material='resin',restitution=.08,...rest}={})=>({id,region,role,points,contact,r,material,restitution,...rest});
export const SOURCE_GUIDE_TRACES=[
 path('left-inlet',1,'left-inlet-guide',[[146.5,368],[142.5,380],[139,390],[135,400],[131.5,410],[129,420],[126.5,430],[124,440],[121.5,450],[119.5,460],[117.5,470],[115.5,480],[114,490],[112.5,500],[111.5,510],[111,520],[110,530],[109.5,540],[109,550],[109,562]],{r:.6,material:'rail',restitution:.12,playfieldOnly:true}),
 path('left-title-edge',2,'lcd-boundary-25',[[187,345],[187,364],[185,367],[176,369],[170,379],[165,390],[160,402],[156.5,413],[152,425],[148.5,440],[146,450],[143.5,462],[141.5,475],[138.5,490],[136,505],[135.5,520],[134.5,535],[134,550],[134,562],[140.2,561.9],[157,585],[169,595],[175,600],[175,619]]),
 // Open tube outline: do not close its two upper ends or bridge the opening.
 path('left-return',3,'lcd-boundary-21',[[176.5,618.1],[183.8,624.4],[191.5,631.6],[201.2,640.5],[206.8,645.8],[212.4,656.1],[212.7,663.7],[212.6,672.2],[212.4,680.3],[211.5,684.5],[206.3,689.3],[200.2,690.8],[195.5,689.8],[192.3,687.5],[190.2,685.2],[187.7,681.8],[188.1,665.7],[182.3,660],[176,653.9],[168.5,646.8]],{r:.7}),
 // Outermost thin silhouette above the road nails is the adopted front contact.
 path('left-return-band',3,'source-frame-detail',[[188,673],[211,673]],{contact:false}),
 path('apron-outer',4,'lcd-boundary-20',[[174.4,659.1],[184.6,668.9],[184,733.3],[395,844],[405,841.5],[420,838.5],[438,836.5],[454,836.5],[469,838],[482,841],[493.3,843.8],[585.2,794.5],[614.7,794.3],[625.1,783.4],[640.3,777.2],[640,742],[665.5,727]],{r:.5}),
 path('apron-moulding',4,'source-frame-detail',[[189.5,691],[189.5,715],[374,808],[397,813],[414,814],[420,818.5],[428,819],[435,816],[440,821.5],[449,821.5],[453,816.5],[460,819],[468,817],[472,815],[489,813],[503,811],[552,795],[579,790],[619,784]],{contact:false}),
 path('apron-inner',4,'source-frame-detail',[[213,675],[400,769],[496,769],[524,754.5],[619,746],[665.5,724]],{contact:false}),
 path('apron-bevel-left',4,'source-frame-detail',[[213,691],[213,702],[398,798],[414,816]],{contact:false}),
 path('apron-bevel-right',4,'source-frame-detail',[[471,815],[488,795],[552,789],[619,784]],{contact:false}),
 path('unit-right-step',5,'lcd-boundary-16',[[775,613],[750,613],[716,629],[684,630],[684,644],[665.5,654],[665.5,716],[672.3,740.9],[672.7,747.5],[663.7,747.6],[662.8,767.4],[656.3,768.3],[624.1,784.3]]),
 path('right-channel-inner',6,'right-channel-traced-inner',[[446.3,156.9],[527.9,163.9],[564,171.7],[605.5,189.7],[648.5,212.7],[673.2,233.2],[689.1,250.1],[684.7,254.6],[684.8,286.9],[697.7,302.8],[710.3,321.4],[722.6,340.9],[733.9,359.6],[747.6,381.5],[756,400],[765,420],[771.5,440],[777,460],[782,480],[786,500],[788,520],[789,539],[787,547],[780,562],[775,575],[775,613]],{restitution:.04}),
 path('right-channel-outer',6,'right-channel-traced-outer',[[771.5,368],[777,380],[785.6,400.3],[792.6,420],[800.2,440.2],[805,460],[809,480],[811,500],[813.5,520],[814,540],[805.5,560],[797,578],[797,613],[808,613]],{restitution:.04}),
 path('right-upper-silhouette',6,'source-frame-detail',[[733,245],[748,263],[762,282],[775,302],[786,321],[797,342],[806,363],[815,389],[815,540]],{contact:false}),
 path('right-attacker-approach',5,'right-channel-traced-approach',[[774,617],[774,630],[772,632],[723,638],[717,640],[713,644],[710,650],[709,655]],{restitution:.04}),
 path('right-return-wall',5,'right-channel-traced-return',[[797,620],[795.5,636],[793,650],[791,659],[786,671],[780,675],[776,678],[771,700],[765.5,722],[763,728],[759,731],[754,733],[749.5,733],[749.5,740],[754,743],[759,748],[763,756],[763,791],[760,797],[750,804],[750,812],[747,822],[742,827],[735,831],[725,834],[714,836],[710.5,840],[710.5,878],[707,889],[701,896],[694,900],[685,902],[684,920],[681,925],[676,926],[667,926],[663,923],[663,898]],{restitution:.04}),
 path('right-return-inner',5,'right-channel-traced-return-inner',[[749.5,733],[749.5,797],[749.6,810.4],[744.7,823.3],[737.3,829.5],[727.3,833.4],[710.5,834.5],[711.2,856.1],[711.2,873.9]],{restitution:.04}),
 path('right-outside-wall',5,'right-channel-traced-outside',[[806,621],[803,642],[800,661],[797,681],[794,704],[794,861],[730.3,865.2],[720.4,872.5],[720.3,890.3],[720.9,916.2],[717,924],[713.1,930.6]],{restitution:.04}),
 path('right-outside-back-edge',5,'source-frame-detail',[[812,621],[809,642],[806,663],[803,683],[800,705],[800,910],[736,911],[725,934]],{contact:false}),
 path('right-lower-guide',5,'right-channel-traced-lower',[[695,748],[695,790],[694,796],[690,800],[685,801],[642.5,804.5],[642.5,809.5],[651.5,819.5],[651.5,849],[649,853],[645,856],[641,859.5],[636,863.5],[632.5,869],[632.9,889.2],[628.7,893.1],[628.6,904.6],[631.6,907.3],[631.9,918.8],[635.5,923.6],[651.4,923.6],[655.4,919.9],[655.5,907.1],[659.2,905.4],[658.8,894],[656.3,891.8],[656.1,886.4],[657.6,885.4],[668.1,884.5],[676.6,877.3],[680.2,868.9],[679.7,851.4],[687.7,843.6]],{r:.4,restitution:.04}),
 path('electric-upper-bevel',5,'source-frame-detail',[[536.7,817.9],[544.6,813.1],[544.5,798],[546.4,795.3],[552.9,795.2],[560.2,794.4],[565.6,791.5],[571.6,787],[622,783.8]],{contact:false}),
 path('electric-outer-bevel',5,'source-frame-detail',[[606.9,799.2],[588.7,799.5],[546.5,821.2],[538,824.9],[531,830],[531.3,844.3],[527.5,848],[528.1,865.9],[535.3,869.9],[541.2,874.3]],{contact:false}),
 path('electric-left-moulding',5,'right-channel-traced-electric',[[606.6,799.2],[605.7,814.6],[595.9,815],[592.1,816.5],[592.2,824.3],[580.9,824.4],[563.1,830.4],[561.5,827.4],[553,830.6],[550.7,832.4],[545.3,835.4],[537.2,840.9],[535.1,847.2],[537,870],[544,875],[559,875],[559,863]],{r:.4,restitution:.04}),
];
export function sourceGuidePaths(){return SOURCE_GUIDE_TRACES.map(p=>({...p,points:p.points.map(q=>[...q]),worldPoints:sourcePath(p.points).map(([x,y])=>({x,y}))}));}
export function installSourceGuideTrace(physics){
 // Keep upper head geometry, moving shutters/shelves, and the starter's small
 // deflector. The user right-inner trace now starts at SOURCE446,157 and
 // replaces head segments 6/7 as well; do not retain an overlapping old edge.
 physics.colliders=physics.colliders.filter(c=>!(c.role==='left-inlet-guide'||c.role.startsWith('lcd-boundary-')&&Number(c.role.slice(13))>=6||c.role==='right-inner-lower'||c.role.startsWith('right-channel-')&&!['right-channel-5-1'].includes(c.role)&&!c.role.startsWith('right-channel-7-')));
 const paths=sourceGuidePaths();
 for(const p of paths.filter(p=>p.contact))for(let i=1;i<p.worldPoints.length;i++)physics.colliders.push({a:{...p.worldPoints[i-1]},b:{...p.worldPoints[i]},r:p.r,material:p.material,role:p.role,restitution:p.restitution,playfieldOnly:p.playfieldOnly,sourceGuideId:p.id,sourceGuideSegment:i-1});
 physics.sourceGuideTraceVersion=SOURCE_GUIDE_TRACE_VERSION;physics.sourceGuidePaths=paths;
}
export function paintSourceGuideTrace(d,pt,physics){
 const retained=physics.colliders.filter(c=>c.role.startsWith('right-channel-7-')).map(c=>({contact:true,r:c.r,worldPoints:[c.a,c.b]}));
 for(const p of [...(physics.sourceGuidePaths??[]),...retained]){const points=p.worldPoints.map(q=>{const a=pt(q);return Array.isArray(a)?a:[a.x,a.y];});
  for(const [width,color]of p.contact?[[4,'#17263b'],[p.r*6,'#7893ac'],[1,'#dcecf5']]:[[1,'#668699']])for(let i=1;i<points.length;i++)d.line(...points[i-1],...points[i],color,width);
 }
}
