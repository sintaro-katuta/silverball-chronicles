// Winning reach: announcement -> mechanical cover/retract -> center reel stop.
// No sound is attached; the ornament never starts from the post-win clock.
export const WIN_SEQUENCE=Object.freeze({
 normal:Object.freeze({reachSeconds:2.5,mechanismAt:.45,mechanismSeconds:1.9,bonusAt:5.8}),
 rush:Object.freeze({reachSeconds:2.5,mechanismAt:.45,mechanismSeconds:1.9,bonusAt:2.4})
});
export const winSequence=fromRush=>WIN_SEQUENCE[fromRush?'rush':'normal'];
export const reachSeconds=(presentation,fromRush)=>presentation?.win?winSequence(fromRush).reachSeconds:fromRush?.45:2;
export const mechanismTime=game=>game.presentation?.basicReach&&game.presentation.win?game.presentation.time-winSequence(!!game.rush).mechanismAt:-1;
