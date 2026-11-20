// Six-shot sheets. Callers may load a subset and use view.hasFamily.
export const STORY_PREDICTION_ASSETS=Object.freeze(Object.fromEntries(
 ['step','memory','episode','pursuit','rescue'].map(kind=>[kind,`/assets/lcd/story-prediction/${kind === 'step' ? 'step-grid-v3' : `${kind}-grid-v2`}.png`])
));
