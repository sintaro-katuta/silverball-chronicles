import {sourcePoint} from './source-layout.js';
// Visible source-image contract; geometry/contact assumptions stay explicit.
export const REFERENCE_RAIL_VISIBLE_SOURCE={
  "version": "attempt08-visible-v1",
  "coordinateSystem": "SOURCE904x1280; world=(22+(sx-72)*.5,180+(sy-120)*.5); not calibrated mm",
  "referencePath": "prototype/reference-review/pixi-source-layout/reference.jpg",
  "components": [
    {
      "id": "outer-thin-band",
      "kind": "edge-band",
      "leftSource": [
        [
          173.5,
          245
        ],
        [
          169.5,
          250
        ],
        [
          161.5,
          260
        ],
        [
          153.5,
          270
        ],
        [
          146.5,
          280
        ],
        [
          140.5,
          288
        ],
        [
          132.5,
          300
        ],
        [
          126.5,
          310
        ],
        [
          121.5,
          320
        ],
        [
          116.5,
          330
        ],
        [
          111.5,
          340
        ],
        [
          106.5,
          350
        ],
        [
          102.5,
          360
        ],
        [
          98.5,
          370
        ],
        [
          94.5,
          380
        ],
        [
          91.5,
          390
        ],
        [
          88.5,
          400
        ],
        [
          85.5,
          410
        ],
        [
          82.5,
          420
        ],
        [
          80.5,
          430
        ],
        [
          76.5,
          450
        ],
        [
          72.5,
          480
        ],
        [
          71.5,
          500
        ],
        [
          70.5,
          530
        ],
        [
          70.5,
          540
        ],
        [
          71.5,
          550
        ]
      ],
      "rightSource": [
        [
          176.5,
          245
        ],
        [
          171.5,
          250
        ],
        [
          163.5,
          260
        ],
        [
          155.5,
          270
        ],
        [
          148.5,
          280
        ],
        [
          142.5,
          288
        ],
        [
          135.5,
          300
        ],
        [
          129.5,
          310
        ],
        [
          123.5,
          320
        ],
        [
          118.5,
          330
        ],
        [
          113.5,
          340
        ],
        [
          108.5,
          350
        ],
        [
          104.5,
          360
        ],
        [
          100.5,
          370
        ],
        [
          96.5,
          380
        ],
        [
          93.5,
          390
        ],
        [
          90.5,
          400
        ],
        [
          87.5,
          410
        ],
        [
          84.5,
          420
        ],
        [
          82.5,
          430
        ],
        [
          78.5,
          450
        ],
        [
          74.5,
          480
        ],
        [
          73.5,
          500
        ],
        [
          72.5,
          530
        ],
        [
          72.5,
          540
        ],
        [
          73.5,
          550
        ]
      ],
      "contactClassification": "candidate-visible-boundary-plane-not-confirmed",
      "certainty": "measured; AA edges +/-0.5..1sourcepx, lower merge uncertain",
      "interpolation": "shape-preserving monotone cubic by source y; sample<=0.5 sourcepx; close left + reversed right. No extra outward stroke."
    },
    {
      "id": "inner-gray-band",
      "kind": "edge-band",
      "leftSource": [
        [
          139.5,
          313
        ],
        [
          137.5,
          315
        ],
        [
          136.5,
          317
        ],
        [
          134.5,
          320
        ],
        [
          128.5,
          330
        ],
        [
          123.5,
          340
        ],
        [
          118.5,
          350
        ],
        [
          113.5,
          360
        ],
        [
          109.5,
          370
        ],
        [
          104.5,
          380
        ],
        [
          101.5,
          390
        ],
        [
          97.5,
          400
        ],
        [
          94.5,
          410
        ],
        [
          91.5,
          420
        ],
        [
          88.5,
          430
        ],
        [
          86.5,
          440
        ],
        [
          84.5,
          450
        ],
        [
          82.5,
          460
        ],
        [
          78.5,
          480
        ],
        [
          76.5,
          500
        ],
        [
          74.5,
          520
        ],
        [
          73.5,
          530
        ],
        [
          73.5,
          540
        ],
        [
          73.5,
          550
        ],
        [
          73.5,
          560
        ],
        [
          73.5,
          580
        ],
        [
          74.5,
          590
        ],
        [
          75.5,
          600
        ],
        [
          78.5,
          620
        ]
      ],
      "rightSource": [
        [
          142.5,
          313
        ],
        [
          143.5,
          315
        ],
        [
          145.5,
          317
        ],
        [
          142.5,
          320
        ],
        [
          136.5,
          330
        ],
        [
          131.5,
          340
        ],
        [
          126.5,
          350
        ],
        [
          121.5,
          360
        ],
        [
          117,
          370
        ],
        [
          112.5,
          380
        ],
        [
          108.5,
          390
        ],
        [
          105,
          400
        ],
        [
          101.5,
          410
        ],
        [
          98.5,
          420
        ],
        [
          96,
          430
        ],
        [
          92.5,
          440
        ],
        [
          90.5,
          450
        ],
        [
          88.5,
          460
        ],
        [
          85.5,
          480
        ],
        [
          82.5,
          500
        ],
        [
          80.5,
          520
        ],
        [
          80.5,
          530
        ],
        [
          80.5,
          540
        ],
        [
          79.5,
          550
        ],
        [
          80.5,
          560
        ],
        [
          80.5,
          580
        ],
        [
          81.5,
          590
        ],
        [
          82.5,
          600
        ],
        [
          85.5,
          620
        ]
      ],
      "contactClassification": "candidate-upper-rail; lower-support-depth-uncertain",
      "certainty": "320..430 measured;313..320 rounded-junction approximation;430..620 visible continuation, not a claimed physical terminal",
      "interpolation": "shape-preserving monotone cubic by source y; sample<=0.5 sourcepx; close left + reversed right. No extra outward stroke."
    },
    {
      "id": "parallel-thin-line",
      "kind": "edge-band",
      "leftSource": [
        [
          126.5,
          355
        ],
        [
          123.5,
          360
        ],
        [
          118.5,
          370
        ],
        [
          114.5,
          380
        ],
        [
          110.5,
          390
        ],
        [
          107.5,
          400
        ],
        [
          103.5,
          410
        ],
        [
          100.5,
          420
        ],
        [
          98.5,
          430
        ],
        [
          93.5,
          450
        ],
        [
          91.5,
          460
        ],
        [
          88.5,
          480
        ],
        [
          85.5,
          500
        ],
        [
          83.5,
          530
        ],
        [
          82.5,
          560
        ],
        [
          83.5,
          575
        ],
        [
          85.5,
          578
        ],
        [
          86.5,
          580
        ]
      ],
      "rightSource": [
        [
          129.5,
          355
        ],
        [
          127.5,
          360
        ],
        [
          123.5,
          370
        ],
        [
          118.5,
          380
        ],
        [
          116.5,
          390
        ],
        [
          111.5,
          400
        ],
        [
          108.5,
          410
        ],
        [
          104.5,
          420
        ],
        [
          102.5,
          430
        ],
        [
          97.5,
          450
        ],
        [
          95.5,
          460
        ],
        [
          91.5,
          480
        ],
        [
          89.5,
          500
        ],
        [
          87.5,
          530
        ],
        [
          86.5,
          560
        ],
        [
          87.5,
          575
        ],
        [
          89.5,
          578
        ],
        [
          90.5,
          580
        ]
      ],
      "contactClassification": "uncertain-visible-only",
      "certainty": "separate visible line; role/depth and exact termination uncertain",
      "interpolation": "shape-preserving monotone cubic by source y; sample<=0.5 sourcepx; close left + reversed right. No extra outward stroke."
    },
    {
      "id": "upper-rim-left",
      "kind": "curve-strip",
      "centerSource": [
        [
          158,
          280
        ],
        [
          153,
          286
        ],
        [
          149,
          294
        ],
        [
          145.5,
          301
        ],
        [
          142.5,
          307
        ],
        [
          141.5,
          311
        ],
        [
          141,
          314
        ]
      ],
      "widthSource": 1.8,
      "contactClassification": "uncertain-visible-only",
      "certainty": "visible thin rim approximation +/-1sourcepx",
      "interpolation": "smooth Catmull-Rom centerline; shared sampled strip polygon, not outside stroke"
    },
    {
      "id": "upper-rim-right",
      "kind": "curve-strip",
      "centerSource": [
        [
          161,
          280
        ],
        [
          165,
          281
        ],
        [
          168,
          285
        ],
        [
          168,
          288
        ],
        [
          165,
          296
        ],
        [
          162.5,
          301
        ],
        [
          159,
          308
        ],
        [
          155,
          314
        ],
        [
          151.5,
          317
        ],
        [
          148,
          318.5
        ],
        [
          144,
          318
        ],
        [
          141,
          316
        ]
      ],
      "widthSource": 1.8,
      "contactClassification": "uncertain-visible-only",
      "certainty": "visible thin rim approximation +/-1sourcepx; white interior remains unfilled",
      "interpolation": "smooth Catmull-Rom centerline; sampled strip polygon"
    },
    {
      "id": "black-valve-stem",
      "kind": "polygon",
      "sourcePoints": [
        [
          157,
          269.5
        ],
        [
          159,
          269.5
        ],
        [
          160,
          280
        ],
        [
          157.5,
          281
        ]
      ],
      "contactClassification": "static-visible-only; ideal valve contact is a separate explicit model",
      "certainty": "visible position/width approximation +/-1sourcepx"
    },
    {
      "id": "black-valve-body",
      "kind": "bezier-fill",
      "sourcePath": [
        [
          "M",
          157,
          283
        ],
        [
          "C",
          161,
          281,
          165,
          283,
          164,
          289
        ],
        [
          "C",
          163,
          294,
          161,
          298,
          158,
          300
        ],
        [
          "C",
          155,
          302,
          151,
          300,
          150,
          296
        ],
        [
          "C",
          151,
          292,
          155,
          285,
          157,
          283
        ],
        [
          "Z"
        ]
      ],
      "contactClassification": "static-visible-only; no full-body collision assumption",
      "certainty": "dark body y295 width~11sourcepx, y300~6..8sourcepx; rounded endpoint300..302 approximate"
    },
    {
      "id": "white-mark",
      "kind": "circle",
      "centerSource": [
        160.5,
        286.5
      ],
      "outerRadiusSource": 4.1,
      "innerRadiusSource": 3.25,
      "contactClassification": "static-visible-only",
      "certainty": "source white mark role unconfirmed; center +/-0.5..1sourcepx"
    }
  ],
  "confirmedContactTargetIds": [
    "ideal-non-return-valve-contact (existing model, shape alignment to be reviewed separately)"
  ],
  "uncertainContactIds": [
    "parallel-thin-line",
    "upper-rim-left",
    "upper-rim-right",
    "black-valve-body",
    "white-mark",
    "inner-gray-band lower430..620",
    "outer-thin-band lowermerge540..550"
  ],
  "majorMeasuredSections": [
    {
      "y": 330,
      "outerX": [
        117,
        118
      ],
      "grayX": [
        129,
        136
      ],
      "outerWidthRange": [
        2,
        3
      ],
      "grayWidthRange": [
        7,
        9
      ],
      "emptyHorizontalWidthRange": [
        10,
        11
      ]
    },
    {
      "y": 340,
      "outerX": [
        112,
        113
      ],
      "grayX": [
        124,
        131
      ],
      "emptyHorizontalWidthRange": [
        10,
        11
      ]
    },
    {
      "y": 350,
      "outerX": [
        107,
        108
      ],
      "grayX": [
        119,
        126
      ],
      "emptyHorizontalWidthRange": [
        10,
        11
      ]
    }
  ],
  "joins": {
    "oldInnerIndex11": "rejected; no forced ellipse return, no fabricated bulge",
    "grayLower": "visible continuation joins exterior grey region;620 is audit scope boundary, not physical termination",
    "unmeasuredLauncher": "retain separately in metadata/model; not a basis for visual acceptance",
    "upperRim": "component strips join gray without filling white hole"
  },
  "rendering": {
    "sharedPolygon": "fill the exact sampled polygon used for any adopted contact; highlights must be clipped inside",
    "removeOverlappingDecor": [
      "scene silhouette7/4/1.4logical support in reference scope",
      "cabinet inset8/6/4.5/1logical trim in reference scope",
      "legacy launch stroke under replaced components"
    ],
    "mask": "outer visible edge, includes whole outer band; not passage-side edge",
    "smoothness": "no pixel-noise corners or thickness step at old interval; no widening for ball clearance"
  },
  "physicsConstants": "101 original pins, radius1.8, gravity/restitution/launch unchanged; contact plane remains an explicit model assumption",
  "reviewScope": "static source/before/after comparison first; width/form acceptance independent of passage results",
  "grayMergeClarification": "At550/560 the low-luminance run can include outer thin line. Do not treat merged threshold run72..80 as full gray fill. Gray left73.5 matches separately classified core74..80, AA uncertainty about1sourcepx."
};

export function sampleMonotoneEdge(points,step=.5){
 const n=points.length;if(n<2||!(step>0))throw new Error('Invalid edge samples');
 const h=[],d=[],m=[];for(let i=0;i<n-1;i++){h[i]=points[i+1][1]-points[i][1];if(!(h[i]>0))throw new Error('Source edge y must increase');d[i]=(points[i+1][0]-points[i][0])/h[i];}
 if(n===2)m[0]=m[1]=d[0];else{
  const end=(a,b,da,db)=>{let v=((2*a+b)*da-a*db)/(a+b);if(v*da<=0)v=0;else if(da*db<0&&Math.abs(v)>Math.abs(3*da))v=3*da;return v;};
  m[0]=end(h[0],h[1],d[0],d[1]);m[n-1]=end(h[n-2],h[n-3],d[n-2],d[n-3]);
  for(let i=1;i<n-1;i++){if(d[i-1]*d[i]<=0)m[i]=0;else{const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}}
 }
 const result=[];for(let i=0;i<n-1;i++){const A=-6*d[i]+3*m[i]+3*m[i+1],B=6*d[i]-4*m[i]-2*m[i+1],peak=A?Math.max(0,Math.min(1,-B/(2*A))):0,maxSlope=Math.max(Math.abs(m[i]),Math.abs(m[i+1]),Math.abs(A*peak*peak+B*peak+m[i])),count=Math.ceil(h[i]*Math.hypot(1,maxSlope)/step);for(let k=0;k<count;k++){const t=k/count,t2=t*t,t3=t2*t;result.push([(2*t3-3*t2+1)*points[i][0]+(t3-2*t2+t)*h[i]*m[i]+(-2*t3+3*t2)*points[i+1][0]+(t3-t2)*h[i]*m[i+1],points[i][1]+h[i]*t]);}}result.push([...points.at(-1)]);return result;
}
const distance=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
function catmull(points){const result=[];for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)],count=Math.max(1,Math.ceil(3*(distance(a,b)+distance(b,c)+distance(c,d))/.5));for(let k=0;k<count;k++){const t=k/count,t2=t*t,t3=t2*t;result.push([0,1].map(axis=>.5*((2*b[axis])+(-a[axis]+c[axis])*t+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*t2+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*t3)));}}result.push([...points.at(-1)]);return result;}
function strip(center,width){const left=[],right=[];for(let i=0;i<center.length;i++){const a=center[Math.max(0,i-1)],b=center[Math.min(center.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(!l)throw new Error('Degenerate visible strip tangent');const nx=-dy/l*width/2,ny=dx/l*width/2;left.push([center[i][0]+nx,center[i][1]+ny]);right.push([center[i][0]-nx,center[i][1]-ny]);}return [...left,...right.reverse()];}
function bezier(path){let last=null;const result=[];for(const command of path){if(command[0]==='M'){last=command.slice(1);result.push([...last]);}else if(command[0]==='C'){const a=last,b=command.slice(1,3),c=command.slice(3,5),d=command.slice(5,7),count=Math.max(1,Math.ceil(3*Math.max(distance(a,b),distance(b,c),distance(c,d))/.5));for(let i=1;i<=count;i++){const t=i/count,u=1-t;result.push([0,1].map(k=>u*u*u*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*d[k]));}last=d;}else if(command[0]!=='Z')throw new Error('Unsupported visible path command');}if(distance(result[0],result.at(-1))<1e-10)result.pop();return result;}
const densePolygon=points=>{const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],count=Math.max(1,Math.ceil(distance(a,b)/.5));for(let j=0;j<count;j++)out.push([a[0]+(b[0]-a[0])*j/count,a[1]+(b[1]-a[1])*j/count]);}return out;};
const circlePolygon=(center,radius)=>{const count=Math.ceil(2*Math.PI*radius/.5);return Array.from({length:count},(_,i)=>{const t=i/count*2*Math.PI;return [center[0]+Math.cos(t)*radius,center[1]+Math.sin(t)*radius];});};
const world=points=>points.map(p=>{const [x,y]=sourcePoint(p);return {x,y};});
export function referenceVisibleRails(){
 const components=REFERENCE_RAIL_VISIBLE_SOURCE.components.map(c=>{
  const out={...c};if(c.kind==='edge-band'){out.sampledLeftSource=sampleMonotoneEdge(c.leftSource);out.sampledRightSource=sampleMonotoneEdge(c.rightSource);out.sourcePolygon=[...out.sampledLeftSource,...[...out.sampledRightSource].reverse()];out.leftWorld=world(out.sampledLeftSource);out.rightWorld=world(out.sampledRightSource);}
  else if(c.kind==='curve-strip')out.sourcePolygon=strip(catmull(c.centerSource),c.widthSource);
  else if(c.kind==='bezier-fill')out.sourcePolygon=bezier(c.sourcePath);
  else if(c.kind==='polygon')out.sourcePolygon=c.sourcePoints.map(p=>[...p]);
  else if(c.kind==='circle'){const [x,y]=sourcePoint(c.centerSource);out.worldCenter={x,y};out.outerRadius=c.outerRadiusSource*.5;out.innerRadius=c.innerRadiusSource*.5;out.sourcePolygon=circlePolygon(c.centerSource,c.outerRadiusSource);out.innerSourcePoints=circlePolygon(c.centerSource,c.innerRadiusSource);out.innerWorldPoints=world(out.innerSourcePoints);}
  else throw new Error('Unknown visible component');
  if(out.sourcePolygon){out.sourcePolygon=densePolygon(out.sourcePolygon);out.worldPolygon=world(out.sourcePolygon);out.sourcePoints=out.sourcePolygon;out.worldPoints=out.worldPolygon;}out.classification=c.contactClassification;return out;
 });
 const outer=components.find(c=>c.id==='outer-thin-band'),gray=components.find(c=>c.id==='inner-gray-band');
 // Left is the exterior side of outer band; right faces the passage. The
 // lower grey continuation is visible, not a measured launcher endpoint.
 const maskExteriorSource=[...outer.sampledLeftSource,[...outer.sampledRightSource.at(-1)],...gray.sampledLeftSource.filter(p=>p[1]>outer.sampledLeftSource.at(-1)[1])];
 return {version:REFERENCE_RAIL_VISIBLE_SOURCE.version,components,maskExteriorSource,maskExteriorWorld:world(maskExteriorSource),outerVisibleEdgeSource:maskExteriorSource,outerVisibleEdgeWorld:world(maskExteriorSource),outerPassageSideWorld:outer.rightWorld,contactAdoption:'not automatically inferred from visible components',joins:REFERENCE_RAIL_VISIBLE_SOURCE.joins};
}

export const getReferenceRailShape=referenceVisibleRails;
