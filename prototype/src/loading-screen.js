export function mountLoadingScreen(host,{onCancel}){
 host.innerHTML=`<main class="loading-screen" aria-labelledby="loadingTitle"><div class="loading-moon" aria-hidden="true">☾</div><p class="loading-brand">月影機関</p><h1 id="loadingTitle">遊技の準備をしています</h1><p class="loading-copy">月の世界を読み込んでいます。</p><progress aria-label="素材の読み込み" max="1" value="0"></progress><p class="loading-status" role="status" aria-live="polite">準備中</p><div class="loading-actions"><button class="secondary" id="loadingRetry" hidden>再試行</button><button class="quiet" id="loadingCancel">コース選択へ戻る</button></div></main>`;
 const progress=host.querySelector('progress'),status=host.querySelector('.loading-status'),retry=host.querySelector('#loadingRetry');
 host.querySelector('#loadingCancel').onclick=onCancel;
 host.querySelector('#loadingTitle').tabIndex=-1;host.querySelector('#loadingTitle').focus();
 return {
  progress({complete,total}){progress.max=total;progress.value=complete;status.textContent=`${Math.floor(complete/total*100)}% · ${complete} / ${total}`;},
  error(onRetry){host.querySelector('#loadingTitle').textContent='読み込みを完了できませんでした';status.textContent='接続を確認して、もう一度お試しください。';retry.hidden=false;retry.onclick=onRetry;retry.focus();}
 };
}
