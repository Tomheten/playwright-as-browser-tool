import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dirname = import.meta.dirname;

run();

async function run() {
    const chromiumPath = join('C:', 'chrome-win140', 'chrome.exe');
    const browser = await chromium.launch({
        args: ['--auto-open-devtools-for-tabs'],
        executablePath: chromiumPath,
        headless: false,
    });

    const ctx = await browser.newContext({});

    // work by `connectOverCDP`
    ctx.addInitScript({ path: join(dirname, '..', 'scripts', 'script-on-page.js') });
    ctx.exposeFunction('playwrightRpcScreenshot', (data) => {
        console.log('--------------------', data);
        writeFileSync('temp.txt', data);
    });

    const page = await ctx.newPage();

    const hello = 'hello by playwright';
    // work by `connectOverCDP`
    ctx.addListener('console', async (event) => {
        if (event.type() === 'dirxml') {
            console.log('console event from browser', event.text());

            await page.evaluate(({ hello }) => {
                console.log(hello);
            }, { hello });
        }
    });

    await page.goto('http://google.com');
}

/** event list
 */
