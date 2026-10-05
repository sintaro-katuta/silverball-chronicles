// Existing logical coordinates, NOT a decision about future pixel-art asset resolution.
// Physics uses top-left board coordinates. All display adapters share this projection.
export const MACHINE_VIEW=Object.freeze({
 width:540,height:880,
 boardOffset:Object.freeze({x:60,y:100}),
 lcd:Object.freeze({x:112,y:172,width:317,height:408,radius:14})
});
export function boardToMachine({x,y}) {
 return {x:x+MACHINE_VIEW.boardOffset.x,y:y+MACHINE_VIEW.boardOffset.y};
}
export function machineToBoard({x,y}) {
 return {x:x-MACHINE_VIEW.boardOffset.x,y:y-MACHINE_VIEW.boardOffset.y};
}
