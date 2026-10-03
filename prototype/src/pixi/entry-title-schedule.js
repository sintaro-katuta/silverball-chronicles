// Complete title playback inside a scene; never skip falling letters or the shine.
export const ENTRY_TITLE_SECONDS=2.4;
export const ENTRY_TITLE_START=Object.freeze({slash:2.15,moon:2.55,reflection:3.45,mechanism:4.25});
export function entryTitleAt(variant){return ENTRY_TITLE_START[variant]??null;}
export function entryTitleDuration(variant){const at=entryTitleAt(variant);return at===null?null:at+ENTRY_TITLE_SECONDS;}
