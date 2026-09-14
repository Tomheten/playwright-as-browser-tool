import { chromium, Page } from '@playwright/test';
import { join } from 'node:path';

const dirname = import.meta.dirname;

run();

async function run() {
    const chromiumPath = join('C:', 'chrome', 'chrome.exe');

    const browser = await chromium.launch({
        executablePath: chromiumPath,
        headless: false,
    });

    const page = await browser.newPage();

    // exposeFunction: нужен реф на page в замыкании
    let currentPage: Page;
    await page.exposeFunction('takeShotByExposeFun', async (sel?: string) => {
        if (!currentPage) throw new Error('no page');
        return currentPage.screenshot({ path: 'art.png' });
    });
    currentPage = page;

    // exposeBinding: page приходит в source
    await page.exposeBinding('takeShotByExposeBind', async (bindingSource, sel?: string) => {
        return bindingSource.page.screenshot({ path: 'art.png' });
    });

    await page.goto('file:///' + join(dirname, '..', 'index.html'));
}
