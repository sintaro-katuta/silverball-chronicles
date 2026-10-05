// Original six-shot sheets. Callers may load a subset and use view.hasFamily.
export const STORY_PREDICTION_ASSETS=Object.freeze(Object.fromEntries(
 ['step','memory','episode','pursuit','rescue'].map(kind=>[kind,`/assets/lcd/story-prediction/${kind}-v1.png`])
));
