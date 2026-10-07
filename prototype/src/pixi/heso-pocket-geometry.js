import {POCKETS_SOURCE} from './source-layout.js';
// Diagram width is preserved separately. These are game contact/display
// calibration values, not measured e Tokyo Ghoul W mouth dimensions.
export const HESO_SOURCE_WIDTH=POCKETS_SOURCE.find(p=>p.kind==='start').w*.5;
export const HESO_MOUTH_WIDTH=20;
export const HESO_DISPLAY_WIDTH_SCALE=HESO_MOUTH_WIDTH/HESO_SOURCE_WIDTH;
