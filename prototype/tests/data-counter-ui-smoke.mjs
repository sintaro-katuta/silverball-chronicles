import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://localhost:5173');await page.locator('#start').click();
 await expect(page.locator('#counterState')).toHaveText('通常',{timeout:60000});
 await page.locator('#debug').click();await page.locator('#debugRush').click();
 await expect(page.locator('#counterState')).toHaveText('RUSH');
 await page.screenshot({path:'screenshots/counter-rush.png'});
 await page.locator('#debug').click();await page.locator('[data-rounds="4"]').click();
 await expect(page.locator('#counterState')).toHaveText('大当り中',{timeout:60000});
 await expect(page.locator('#counterJackpots')).toHaveText('1');
 await expect(page.locator('#sinceJackpot')).toHaveText('0');
 await page.screenshot({path:'screenshots/counter-bonus.png'});
 console.log('Normal, RUSH and bonus counter transitions verified.');
}finally{await browser.close();}
