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
    cdp.addListener('DOM.attributeModified', (ev) => {
        console.log('----------- event', ev);
    });

    await page.pause();
}

run();

