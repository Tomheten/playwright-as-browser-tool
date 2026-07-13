import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import waitOn from 'wait-on';

async function run() {
    const dirname = import.meta.dirname;
    const debuggingPort = 9222;
    const testProfilePath = join('C:', 'browser-profile-tmp');
    const chromiumPath = join('C:', 'chrome-w', 'chrome.exe');
    // const resource = 'https://accounts.google.com';
    const resource = 'https://sbermarket.ru';

    // const br = await chromium.launch({
    //     executablePath: chromiumPath,
    //     headless: false,
    // });

    // const p = await br.newPage();
    // await p.goto(resource);

    /** empty the profile dir*/
    const chromiumProfileDirs = await readdir(testProfilePath);
    // await Promise.all(chromiumProfileDirs.map(n => rm(join(testProfilePath, n), { recursive: true, force: true })));

 

    /** wait running browser */
    await waitOn({ resources: [`http://localhost:${debuggingPort}`], timeout: 10_000 });

    // const browser = await chromium.connectOverCDP('http://localhost:9222');
    // const pages = browser.contexts()[0].pages();

    // const targetPage = pages[0];
    // await targetPage.locator('.chr-header-v3__hamburger-button').click();
    // await targetPage.locator('.chr-header-v3__hamburger-button').click();
}

run();
