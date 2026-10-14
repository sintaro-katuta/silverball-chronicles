import test from 'node:test';import assert from 'node:assert/strict';
import {prepareSolidPolygon,circlePolygonContact,collideSolidPolygon} from '../src/physics/solid-polygon-contact.js';
const rectangle=[{x:0,y:0},{x:4,y:0},{x:4,y:10},{x:0,y:10}],make=points=>({solid:prepareSolidPolygon(points),restitution:.05});
const ball=(x,y,vx=0,vy=0,r=1)=>({x,y,vx,vy,r});const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('solid vertices retain exact visible outline; malformed or self-crossing bands are refused',()=>{
 const source=structuredClone(rectangle),solid=prepareSolidPolygon(source);assert.deepEqual(solid.points,rectangle);source[0].x=900;assert.equal(solid.points[0].x,0);assert.deepEqual(prepareSolidPolygon([...rectangle,rectangle[0]]).points,rectangle);
 for(const points of [[],[{x:0,y:0},{x:0,y:0},{x:2,y:2}], [{x:0,y:0},{x:4,y:4},{x:0,y:4},{x:4,y:0}], [{x:0,y:0},{x:4,y:4},{x:0,y:4},{x:4,y:0},{x:5,y:-1}], [{x:0,y:0},{x:Infinity,y:4},{x:0,y:4}]])assert.throws(()=>prepareSolidPolygon(points));
});
test('both sides and end faces use actual band boundary, not a centreline radius',()=>{
 const c=make(rectangle);for(const [b,expected,velocity]of [[ball(-.5,5,100,0),[-1,5],[-5,0]],[ball(4.5,5,-100,0),[5,5],[5,0]],[ball(2,-.5,0,100),[2,-1],[0,-5]],[ball(2,10.5,0,-100),[2,11],[0,5]]]){near(collideSolidPolygon(b,c),100);near(b.x,expected[0]);near(b.y,expected[1]);near(b.vx,velocity[0]);near(b.vy,velocity[1]);assert.equal(circlePolygonContact(b,c.solid),null);}
 const away=ball(-.5,5,-100,25);assert.equal(collideSolidPolygon(away,c),0);assert.equal(away.vx,-100);assert.equal(away.vy,25);
});
test('finite corners follow radial circle contact and outside bands leave state unchanged',()=>{
 const c=make(rectangle),b=ball(-.5,-.5,100,100);assert.ok(collideSolidPolygon(b,c)>0);near(Math.hypot(b.x,b.y),1);assert.ok(b.x<0&&b.y<0&&b.vx<0&&b.vy<0);
 for(const b of [ball(-1.00001,5,100,0),ball(2,12,0,-100),ball(100,100)]){const before={...b};assert.equal(collideSolidPolygon(b,c),0);assert.deepEqual(b,before);}
});
test('inside and boundary penetration is resolved to nearest exterior without adding speed',()=>{
 for(const points of [rectangle,[...rectangle].reverse()]){const c=make(points),b=ball(.2,5,100,0);assert.equal(circlePolygonContact(b,c.solid).inside,true);near(collideSolidPolygon(b,c),100);near(b.x,-1);near(b.y,5);near(b.vx,-5);const boundary=ball(0,5,0,0);collideSolidPolygon(boundary,c);near(boundary.x,-1);near(boundary.vx,0);}
});
test('concave empty region is traversable while nearby visible inner corner has contact',()=>{
 const c=make([{x:0,y:0},{x:6,y:0},{x:6,y:2},{x:2,y:2},{x:2,y:6},{x:0,y:6}]);assert.equal(circlePolygonContact(ball(4,4),c.solid),null);assert.ok(circlePolygonContact(ball(2.5,2.5),c.solid));const inside=ball(1.8,3,-100,0);collideSolidPolygon(inside,c);near(inside.x,3);near(inside.y,3);near(inside.vx,5);
});
test('small synthetic travel substeps keep a fast circle outside band; solver coefficients stay .05',()=>{
 const c=make(rectangle),b=ball(-5,5,2000,0),h=1/6000;let touched=false;for(let i=0;i<40;i++){b.x+=b.vx*h;b.y+=b.vy*h;const impulse=collideSolidPolygon(b,c);if(impulse)touched=true;assert.ok(b.x<=-1+1e-9);}assert.equal(touched,true);near(b.vx,-100);assert.equal(c.restitution,.05);
});

test('bounded repeated contacts resolve a concave two-face overlap without extra force',()=>{
 const c=make([{x:0,y:0},{x:6,y:0},{x:6,y:2},{x:2,y:2},{x:2,y:6},{x:0,y:6}]),b=ball(2.5,2.5,-100,-100);let iterations=0;
 while(circlePolygonContact(b,c.solid)&&iterations<10){collideSolidPolygon(b,c);iterations++;}
 assert.ok(iterations<=2);assert.equal(circlePolygonContact(b,c.solid),null);near(b.x,3);near(b.y,3);near(b.vx,5);near(b.vy,5);
});

test('partial adopted surface range does not turn uncertain lower band into a wall',()=>{
 const c={...make(rectangle),contactYRange:{min:2,max:6}},lower=ball(-.5,8,100,0),before={...lower};assert.equal(collideSolidPolygon(lower,c),0);assert.deepEqual(lower,before);const upper=ball(-.5,4,100,0);assert.equal(collideSolidPolygon(upper,c),100);near(upper.x,-1);
});
