import { chromium } from '@playwright/test';
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import waitOn from 'wait-on';
import { runBrowser } from '../scripts/run-browser';

async function run() {
    const dirname = import.meta.dirname;
    const debuggingPort = 9222;
    // const testProfilePath = join('C:', 'browser-profile-tmp');
    // const chromiumPath = join('C:', 'chrome', 'chrome.exe');
    // // const resource = 'https://accounts.google.com';
    // const resource = 'https://sbermarket.ru';

    // const br = await chromium.launch({
    //     executablePath: chromiumPath,
    //     headless: false,
    // });

    // const p = await br.newPage();
    // await p.goto(resource);

    // runBrowser({ chromiumPath, testProfilePath, resource });

    /** empty the profile dir*/
    // await emptyProfileDir(testProfilePath);

    /** wait running browser */
    await waitOn({ resources: [`http://localhost:${debuggingPort}`], timeout: 10_000 });

    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const firstCtx = browser.contexts()[0];
    const pages = firstCtx.pages();
    const targetPage = pages[0];
    await targetPage.pause();
}

run();

