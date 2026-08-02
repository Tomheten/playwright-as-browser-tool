import { chromium, selectors } from '@playwright/test';
import { join } from 'node:path';
import waitOn from 'wait-on';
import { runBrowser } from '../scripts/run-browser';

const dirname = import.meta.dirname;
run();

// getting jpeg, png, pdf, video
async function run() {
    const chromiumPath = join('C:', 'chrome-win140', 'chrome.exe');
    const browser = await chromium.launch({ executablePath: chromiumPath, headless: false });
    // const ctx = await browser.newContext({
    //     recordHar: { path: join('..', 'log.har') },
    //     recordVideo: { showActions: { duration: 2000, fontSize: 12 } },
    //     reducedMotion: 'reduce',
    // });

    // ctx.tracing.start();
    // ctx.tracing.stop({ path: join(`trace-${Temporal.PlainTime.toString()}.zip`) });

    const context = await browser.newContext();
    const page = await context.newPage();

    let currentVideoPath: string | null = null;

    await page.exposeFunction('startVideo', async () => {
        const fileName = `video_${Date.now()}.webm`;
        const filePath = join(dirname, fileName);

        currentVideoPath = filePath;

        await page.screencast.start({
            path: filePath,
            size: { width: 1280, height: 800 },
        });

        return { started: true, file: fileName };
    });

    await page.exposeFunction('stopVideo', async () => {
        if (!currentVideoPath) {
            return { error: 'Video was not started' };
        }

        await page.screencast.stop();

        const saved = currentVideoPath;
        currentVideoPath = null;

        return { stopped: true, file: saved };
    });

    await page.exposeFunction('makeScreenshot', async () => {
        const fileName = `screenshot_${Date.now()}.png`;
        const filePath = join(dirname, fileName);

        await page.screenshot({ path: filePath });

        return { saved: fileName };
    });


    page.goto('http://yandex.ru')
}
