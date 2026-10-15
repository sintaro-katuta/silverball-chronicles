import {compareLayouts} from './pin-layout-measurement.js';
import {engineGeometryHash} from './pin-layout-model.js';
import {loadCodeEvidence} from './pin-layout-source.js';
self.onmessage=async({data})=>{const {requestID}=data;try{const before=await loadCodeEvidence();const result=await compareLayouts(data.layout,{codeSHA:before.codeSHA,onProgress:value=>self.postMessage({type:'progress',value,requestID})});const after=await loadCodeEvidence();if(before.codeSHA!==after.codeSHA)throw new Error('計測中に試射ソースが変化しました。再生成・再計測してください。');result.sourceEvidence={before,after,unchanged:true};result.engineGeometryHash=await engineGeometryHash();self.postMessage({type:'result',result,requestID});}catch(e){self.postMessage({type:'error',message:e.message,requestID});}};
