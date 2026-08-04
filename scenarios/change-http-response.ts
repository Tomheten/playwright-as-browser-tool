// suggest-ya.cgi - смотри query - `part`, в начале пример на подмену заготовленным моком, потом показать подмену через иземенени реального ответа
// fetch -> изменяем -> отдаем браузеру

import { chromium } from '@playwright/test';
import { join } from 'node:path';

run();

async function run() {
    const chromiumPath = join('C:', 'chrome-win', 'chrome.exe');
    const browser = await chromium.launch({ executablePath: chromiumPath, headless: false });
    const page = await browser.newPage();

    // работают текстовые маски - page.route('**/*')
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

    page.on('request', (request) => {
        console.log('>>>>>>> request', request.url());
    });

    page.on('response', (response) => {
        console.log('<<<<<<< response', response.ok());
    });

    await page.goto('http://yandex.ru');

    // 
    // await page.waitForRequest();
    // await page.waitForResponse();
}

const fakeResponseHints = [
    'react',
    [
    [
        '',
        'VueJs намного лучше',
        {
            'sg_weight': 0,
            'log': ['fulltext', 'none', 'b'],
            'hl': [[0, 10]],
        },
    ],
    [
        '',
        'use VueJs instead',
        {
            'pers': 1,
            'sg_weight': 0,
            'log': ['fulltext', 'history', 'pers'],
            'hl': [[0, 3]],
        },
    ],
  
    ],
          {
        "r": 10174,
        "pers_options": 1,
        "log": "sgtype:BBBBBBBBBB",
        "continue": "tion"
    }
];
