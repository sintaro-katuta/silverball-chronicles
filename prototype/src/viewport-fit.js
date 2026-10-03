// Fit the complete cabinet into the space actually left by data and controls.
// visualViewport also follows Safari's toolbar, orientation and browser zoom.
export function mountViewportFit(shell){
 const column=shell.querySelector('.machine-column'),board=shell.querySelector('.board-wrap'),dashboard=shell.querySelector('.machine-dashboard'),controls=shell.querySelector('.control-panel');
 const viewport=window.visualViewport;let frame=0,disposed=false;
 function fit(){
  frame=0;if(disposed||!shell.isConnected)return;
  const height=viewport?.height??window.innerHeight,width=viewport?.width??window.innerWidth;
  shell.style.setProperty('--viewport-height',`${height}px`);shell.style.setProperty('--viewport-width',`${width}px`);
  shell.style.setProperty('--viewport-top',`${viewport?.offsetTop??0}px`);shell.style.setProperty('--viewport-left',`${viewport?.offsetLeft??0}px`);
  const style=getComputedStyle(column),paddingY=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),paddingX=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight),gap=parseFloat(style.rowGap)||0;
  const available=Math.max(1,column.clientHeight-paddingY-dashboard.getBoundingClientRect().height-controls.getBoundingClientRect().height-gap*2);
  const ratio=Number(getComputedStyle(board).getPropertyValue('--machine-ratio'))||460/740;
  const target=Math.max(1,Math.min(column.clientWidth-paddingX,available*ratio));
  if(Math.abs(parseFloat(board.style.width||'0')-target)>.1)board.style.width=`${target}px`;
 }
 const schedule=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(fit);};
 const resize=new ResizeObserver(schedule);[column,dashboard,controls].forEach(node=>resize.observe(node));
 const mutations=new MutationObserver(schedule);mutations.observe(shell,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',schedule);viewport?.addEventListener('resize',schedule);viewport?.addEventListener('scroll',schedule);fit();
 return {refresh:schedule,dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();mutations.disconnect();window.removeEventListener('resize',schedule);viewport?.removeEventListener('resize',schedule);viewport?.removeEventListener('scroll',schedule);}};
}
