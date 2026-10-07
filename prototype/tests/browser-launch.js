// CI uses Playwright's version-matched Chromium; local reviews default to Chrome.
export function browserLaunchOptions(env=process.env){
 const selection=env.PLAYWRIGHT_BROWSER??'chrome';
 if(!['chrome','chromium'].includes(selection))throw new Error('PLAYWRIGHT_BROWSER must be chrome or chromium');
 return {headless:true,...(selection==='chrome'?{channel:'chrome'}:{}),args:env.REVIEW_HOST_RESOLVER_RULES?['--host-resolver-rules='+env.REVIEW_HOST_RESOLVER_RULES]:[]};
}
