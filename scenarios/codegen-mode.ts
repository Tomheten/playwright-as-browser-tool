import { chromium } from '@playwright/test';
import { join } from 'node:path';
import waitOn from 'wait-on';
import { runBrowser } from '../scripts/run-browser';

const testProfilePath = join('C:', 'browser-profile-tmp');
const chromiumPath = join('C:', 'chrome-win', 'chrome.exe');
const dirname = import.meta.dirname;
const resource = 'file:///' + join(dirname, '..', 'index.html');
// const resource = 'https://google.com';

runBrowser({ chromiumPath, testProfilePath, resource });
run();

async function run() {
    const debuggingPort = 9222;

    /** wait running browser */
    await waitOn({ resources: [`http://localhost:${debuggingPort}`], timeout: 10_000 });

    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const firstCtx = browser.contexts()[0];
    const pages = firstCtx.pages();
    const targetPage = pages[0];


    /** можно записать сценарий и потом воспроизвести на нужной странице*/
    await targetPage.pause();

    /** for setting `dataTestIdAttribute` need to create a new page by Playwright */
    // selectors.setTestIdAttribute('data-test-id');
    // const pageByPw = await browser.newPage();
    // await pageByPw.goto(resource);
    // await pageByPw.pause();
}
