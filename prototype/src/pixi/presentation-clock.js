// Presentation can defer the next draw or round, but mechanical opening
// deadlines still advance on the same game clock. Pause stops both clocks.
export function advancePresentationClock(game,dt){
 if(game.phase!=='playing')return;
 if(game.advanceClock)game.advanceClock(dt);
 else game.time+=dt;
}
