import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import waitOn from 'wait-on';

async function run() {
    const dirname = import.meta.dirname;
    const debuggingPort = 9222;

    /** wait running browser */
    await waitOn({ resources: [`http://localhost:${debuggingPort}`], timeout: 10_000 });

    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const cdp = await browser.newBrowserCDPSession();
    const ctx = browser.contexts()[0];

    const page = await ctx.newPage();

    await page.goto('chrome://version');
    let envInfo: string[] = [];
    const cpuInfo = execSync('wmic cpu get', { encoding: 'utf-8' });
    console.log('--------- cpu', cpuInfo);

    const browserVersion = await cdp.send('Browser.getVersion');
    envInfo.push(cpuInfo);
    envInfo.push('' + JSON.stringify(browserVersion));


    writeFileSync('env.md', envInfo.join('\n------\n'))
    // await page.pause();
    browser.close();
}

run();

