import test from 'node:test';
import assert from 'node:assert/strict';
import {initialDocument,exportDocument,importDocument} from '../src/dev/guide-editor-model.js';
import {editorScopeLines,isRightJoiningLine} from '../src/dev/guide-editor-scope.js';
test('right editing includes the user diamond and preserves all left lines in saved work',()=>{
 const doc=initialDocument();doc.lines.push({id:'user-diamond',sourceTemplateId:null,name:'右下ひし形',kind:'guide',mode:'polyline',closed:false,reviewed:false,visible:true,points:[[628.7,837.3],[621.4,832.5],[613.4,835],[613.3,840],[621.6,848.2],[628.3,842.1],[628.6,837.5]]});
 const before=structuredClone(doc),right=editorScopeLines(doc,'right');
 assert.ok(right.some(l=>l.name==='右下ひし形'));assert.ok(right.some(l=>l.id==='right-lower-guide'));
 assert.ok(!right.some(l=>l.id==='left-inlet'));assert.ok(!right.some(isRightJoiningLine));
 assert.deepEqual(doc,before);assert.deepEqual(importDocument(exportDocument(doc)),before);
 assert.equal(editorScopeLines(doc,'all').length,23);
});
test('a new empty selected line remains editable while right mode filters other empty drafts',()=>{
 const doc=initialDocument();doc.lines.push({id:'new-selected',points:[]},{id:'old-empty',points:[]});
 const right=editorScopeLines(doc,'right','new-selected');assert.ok(right.some(l=>l.id==='new-selected'));assert.ok(!right.some(l=>l.id==='old-empty'));
});
