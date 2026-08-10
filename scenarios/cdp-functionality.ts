import { chromium } from '@playwright/test';
import waitOn from 'wait-on';

async function run() {
    const dirname = import.meta.dirname;
    const debuggingPort = 9222;

    /** wait running browser */
    await waitOn({ resources: [`http://localhost:${debuggingPort}`], timeout: 10_000 });

    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const ctx = browser.contexts()[0];
    const pages = ctx.pages();
    const page = pages[0];
    const cdp = await ctx.newCDPSession(page);
    await page.evaluate(() => {
        console.log('------------- playwright is attached',);
    });
    const browserCdp = await browser.newBrowserCDPSession();
    /** информация о текущем состоянии DOM */
    await cdp.send('DOMSnapshot.enable');
    const snapshot = await cdp.send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
    // console.log('------- snapshot', snapshot);
    debugger;
    const browserInfo = await browserCdp.send('Browser.getVersion');
    console.log('----------- info', browserInfo);



    await page.pause();
    await browser.close();
}

run();

