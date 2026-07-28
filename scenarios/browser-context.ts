import { chromium, selectors } from '@playwright/test';
import { join } from 'node:path';
import waitOn from 'wait-on';
import { runBrowser } from '../scripts/run-browser';

const testProfilePath = join('C:', 'browser-profile-tmp');
const chromiumPath = join('C:', 'chrome-w', 'chrome.exe');
const dirname = import.meta.dirname;
const resource = 'file:///' + join(dirname, '..', 'index.html');

runBrowser({ chromiumPath, testProfilePath, resource });
run();

// getting jpeg, png, pdf, video
async function run() {
    const debuggingPort = 9222;

    /** wait running browser */
    await waitOn({ resources: [`http://localhost:${debuggingPort}`], timeout: 10_000 });

    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const ctx = await browser.newContext({
        recordHar: { path: join('..', 'log.har') },
        recordVideo: { showActions: { duration: 2000, fontSize: 12 } },
        reducedMotion: 'reduce',
    });
    
    ctx.tracing.start();
    ctx.tracing.stop({ path: join(`trace-${Temporal.PlainTime.toString()}.zip`) });
}
