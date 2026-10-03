mergeInto(LibraryManager.library, {
 YozoraReport: function(ptr) {
  var data=UTF8ToString(ptr);
  var el=document.getElementById('telemetry');if(el)el.textContent=data;
  window.parent.postMessage({type:'yozora-state',data:JSON.parse(data)},window.location.origin);
 }
});
