import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LCD_LAYOUT,LCD_OPENING} from '../src/pixi/lcd-layout.js';
import {VIDEO_SCREEN,VIDEO_IMAGE_TOP,VIDEO_IMAGE_BOTTOM,VIDEO_CONTENT_SCALE,VIDEO_HOLD,LEGACY_HOLD,VIDEO_SAFE_UI,VIDEO_RUSH_REELS,VIDEO_FULL_REELS,videoContentToBoard} from '../src/pixi/video-screen-layout.js';
function inside(x,y){let result=false;for(let i=0,j=LCD_OPENING.length-1;i<LCD_OPENING.length;j=i++){
 const [xi,yi]=LCD_OPENING[i],[xj,yj]=LCD_OPENING[j];
 if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)result=!result;
}return result;}
test('16:9 video covers the opening without stretching',()=>{
 assert.equal(VIDEO_SCREEN.width/VIDEO_SCREEN.height,16/9);
 for(const [x,y] of LCD_OPENING){assert.ok(x>=VIDEO_SCREEN.x&&x<=VIDEO_SCREEN.x+VIDEO_SCREEN.width);assert.ok(y>=VIDEO_SCREEN.y&&y<=VIDEO_SCREEN.y+VIDEO_SCREEN.height);}
 assert.equal(VIDEO_CONTENT_SCALE,VIDEO_SCREEN.width/210);
 assert.deepEqual(videoContentToBoard(0,VIDEO_IMAGE_TOP),{x:VIDEO_SCREEN.x,y:VIDEO_SCREEN.y});
 assert.ok(Math.abs(videoContentToBoard(210,VIDEO_IMAGE_BOTTOM).y-(VIDEO_SCREEN.y+VIDEO_SCREEN.height))<1e-9);
});
test('hold indicators fit the opening in video and legacy layouts',()=>{
 const scale=LCD_LAYOUT.height/140;
 const legacy=(x,y)=>({x:LCD_LAYOUT.x+(LCD_LAYOUT.width-210*scale)/2+x*scale,y:LCD_LAYOUT.y+y*scale});
 for(const [hold,map] of [[VIDEO_HOLD,videoContentToBoard],[LEGACY_HOLD,legacy]]){
  for(let x=36;x<=155;x+=2)for(let y=124;y<=138;y+=2){
   const p=map(hold.x+x*hold.scale,hold.y+y*hold.scale);
   assert.ok(inside(p.x,p.y),`hold outside opening at ${p.x},${p.y}`);
  }
 }
});

test('video RUSH and full-rotation reels stay inside the safe area and above the hold tray',()=>{
 for(const layout of [VIDEO_RUSH_REELS,VIDEO_FULL_REELS]){
  for(let i=0;i<3;i++){
   const left=layout.left+i*layout.step,right=left+40*layout.scale,bottom=layout.top+50*layout.scale;
   assert.ok(left>=VIDEO_SAFE_UI.left&&right<=VIDEO_SAFE_UI.right);
   assert.ok(layout.top>=VIDEO_SAFE_UI.top&&bottom<=VIDEO_SAFE_UI.bottom);
   for(const x of [left,right])for(const y of [layout.top,bottom]){
    const p=videoContentToBoard(x,y);assert.ok(inside(p.x,p.y));
   }
  }
 }
 const status={left:52.5,right:157.5,top:29,bottom:43};
 assert.ok(status.left>=VIDEO_SAFE_UI.left&&status.right<=VIDEO_SAFE_UI.right);
 assert.ok(status.bottom<VIDEO_RUSH_REELS.top);
});
