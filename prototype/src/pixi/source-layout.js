// Coordinates are transcribed from the user-supplied 904×1280 board diagram.
// One uniform transform preserves the diagram's horizontal/vertical proportions.
export const sourcePoint=([x,y])=>[22+(x-72)*.5,180+(y-120)*.5];
export const sourcePath=p=>p.map(sourcePoint);
export const SCREEN_SOURCE=[[197,366],[699,366],[711,388],[711,622],[685,629],[685,643],[665,653],[665,716],[620,746],[524,755],[497,770],[399,770],[214,676],[213,658],[200,632],[196,594],[192,566],[197,397]];
export const FRAME_SOURCE=[[185,356],[706,356],[720,387],[720,632],[697,640],[697,650],[677,662],[677,733],[638,765],[531,778],[503,792],[397,795],[194,690],[192,662],[176,641],[165,603],[137,573],[139,394]];
export const LEFT_INLET_GUIDES_SOURCE=[[[132,366],[123,403],[116,467],[112,562]],[[151,368],[141,407],[136,467],[134,562]]];
export const UNIT_SOURCE=[[192,346],[224,301],[238,253],[285,202],[279,185],[390,174],[445,158],[544,163],[620,202],[690,264],[710,365],...FRAME_SOURCE.slice(2,-3),[192,594],[192,566],[197,397],[196,370]];
// Individually remeasured from the W diagram on 2026-10-03; ±1 source px.
export const RIGHT_PRIZE_SOURCE=[[614.5,806.5],[635.5,806.5],[627.5,826]];
export const HESO_PINS_SOURCE=[[434.5,847.5],[454.5,847.5]];
export const LEFT_PINS_SOURCE=[
 [181,260.5],[185,268.5],[187.5,277.5],[188.5,285.5],[186.5,307],
 [174,323.5],[178.5,348.5],[171.5,353.5],[151,357.5],[131.5,348.5],
 [112,568.5],[134,568.5],[144,581.5],[150.5,588],[156,595],
 [96,583.5],[102.5,589.5],[90,606.5],[96.5,611.5],[103.5,616.5],
 [122.5,601.5],[141,611.5],[164.5,611],[119.5,629.5],[126.5,635.5],
 [158,630.5],[163,637.5],[168,656.5],[168,666],[168,675.5],
 [113.5,652.5],[123.5,683],[140.5,650.5],[147.5,656.5],[134,664.5],
 [147.5,666],[147.5,675.5],[195.5,777.5],[203.5,781.5],[211,786],
 [218.5,789.5],[208,809],[222.5,826.5],[231.5,808.5],[237.5,799.5],
 [244.5,803.5],[252.5,807.5],[276.5,803.5],[268.5,823.5],[276.5,827.5],
 [243.5,826.5],[290.5,845.5],[300.5,817.5],[301.5,826.5],[325,827.5],
 [311,845.5],[318.5,849.5],[326.5,853.5],[333.5,857.5],[341.5,861.5],
 [347.5,881.5],[368,865],[388.5,857.5],[410.5,854.5],[434.5,847.5],
 [454.5,847.5],[478.5,854.5],
 ...RIGHT_PRIZE_SOURCE,
];
// Individually transcribed ring centers: 10 + 12 + 4 nails, with two spill gaps.
// Diagram blur gives roughly ±1 source pixel uncertainty; these are not machine measurements.
export const ROAD_SOURCE=[
 [173,736],[180.5,739.5],[188,743.5],[196,747.5],[204,751.5],
 [211.5,755.5],[219,759.5],[226.5,763.5],[234.5,768],[242.5,772],
 [261,782.5],[269,786.5],[277,790.5],[284.5,794.5],[292,798.5],[300,802],
 [308,806.5],[315,810.5],[323.5,814.5],[331,819],[339,823.5],[347,827.5],
 [363.5,836],[371,840.5],[379.5,845],[387.5,848.5],
];
export const RIGHT_ROAD_SOURCE=[[499.5,857.5],[501.5,848.5],[509,844],[516.5,840.5],[524.5,836.5]];
export const POCKETS_SOURCE=[
 {id:0,kind:'normal',x:233,y:845,w:20},
 {id:1,kind:'normal',x:300,y:871,w:20},
 {id:2,kind:'normal',x:325,y:886,w:19},
 {id:4,kind:'start',x:445,y:866,w:24},
];
// The circled 1 at (548,850) labels the electric starter's award, not another pocket.
// The lower circled 1 labels the ordinary-symbol starter: its mouth is above the label.
// Coordinates/width are a drawing transcription, not measured machine dimensions.
export const FUZU_START_SOURCE={id:8,kind:'fuzu',x:570,y:899,w:28};
export const ATTACKER_SOURCE=[740,620];
export const DENCHU_SOURCE=[589,844];
export const RIGHT_EDGES_SOURCE={
 left:[[706,245],[737,301],[771,402],[787,529],[775,574],[775,613]],
 right:[[738,245],[778,300],[813,389],[815,545],[799,580],[797,617]],
};
export const LOWER_RIGHT_SOURCE=[
 [[796,617],[786,650],[774,710],[758,729],[741,782],[695,806],[670,837],[652,860],[644,897],[626,921]],
 [[775,613],[773,632],[746,640]],
 [[740,689],[726,743],[690,771],[660,794],[638,798]],
 [[635,856],[573,856]],
 // Left wall of the electric-starter moulding, visible in the supplied board diagram.
 [[606,800],[606,812],[594,816],[594,825],[570,832],[541,845],[532,855],[532,871],[549,879],[560,879]],
];

// Polygonal resin boss beside the electric starter; it is not a fourth nail.
export const ELECTRIC_DEFLECTOR_SOURCE=[[614,840],[623,836],[631,842],[629,849],[622,858],[616,851],[614,840]];
