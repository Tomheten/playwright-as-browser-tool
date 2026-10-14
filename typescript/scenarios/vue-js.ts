import { chromium } from '@playwright/test';
import { join } from 'path';

/** запустить браузер с флагом ` --remote-debugging-port=9222 `, перейти на `https://ya.ru/search`
 * потом эту функцию запускаем
 */
run();

const dirname = import.meta.dirname;
async function run() {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const firstCtx = browser.contexts()[0];
    const pages = firstCtx.pages();
    const page = pages[0];


    const fileName = `video_${performance.now()}.webm`;
    const filePath = join(dirname, fileName);

    const fakeResponseHints = [
        'react',
        [[
            '',
            'VueJs намного лучше',
            {
                'sg_weight': 0,
                'log': ['fulltext', 'none', 'b'],
                'hl': [[0, 10]],
            },
        ], ['',
            'use VueJs instead',
            {
                'pers': 1,
                'sg_weight': 0,
                'log': ['fulltext', 'history', 'pers'],
                'hl': [[0, 3]],
            },],
        ],
        { "r": 10174, "pers_options": 1, "log": "sgtype:BBBBBBBBBB", "continue": "tion" }
    ];
    page.route(
        (url) => {
            return true;
        },
        async (route, request) => {
            const queryParams = new URL(request.url()).searchParams;
            /** вводим в поиск `react` и получаем подмененный ответ */
            const wordForHints = 'react';
            if (queryParams.get('part') === wordForHints) {
                /** можно послать запрос на сервер и подменить уже ответ,
                 * но могут проблемы с серверными проверками запроса
                 */
                // const response = await route.fetch();
                await route.fulfill({
                    body: JSON.stringify(fakeResponseHints),
                });
            } else {
                route.continue();
            }
        },
    );

    await page.screencast.start({
        path: filePath,
        size: { width: 1280, height: 800 },
    });

    const inputSearch = page.getByRole('combobox');
    await inputSearch.click();
    await inputSearch.pressSequentially('react', { delay: 650 });
    await page.waitForTimeout(3000);
    await page.screencast.stop();
    await firstCtx.close()
    await browser.close()
}

