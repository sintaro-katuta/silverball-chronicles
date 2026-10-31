import {SOURCE_GUIDE_TRACES} from '../pixi/source-guide-trace.js';
const rightTemplates=new Set(SOURCE_GUIDE_TRACES.filter(p=>p.region===5||p.region===6).map(p=>p.id));
const joiningTemplates=new Set(['apron-outer','apron-moulding','apron-inner','apron-bevel-right']);
export function isRightEditorLine(line){
 if(line.sourceTemplateId)return rightTemplates.has(line.sourceTemplateId);
 return line.points.some(([x,y])=>x>=500&&y>=150&&y<=960);
}
export function editorScopeLines(doc,scope,selected=null){
 return scope==='right'?doc.lines.filter(line=>isRightEditorLine(line)||line.id===selected&&line.points.length===0):doc.lines;
}
// Joining LCD/apron edges remain visible for context; filtering never deletes
// or rewrites any line in the document or its exported payload.
export const isRightJoiningLine=line=>joiningTemplates.has(line.sourceTemplateId);
