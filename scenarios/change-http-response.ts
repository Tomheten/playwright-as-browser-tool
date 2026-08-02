// suggest-ya.cgi - смотри query - `part`, в начале пример на подмену заготовленным моком, потом показать подмену через иземенени реального ответа
// fetch -> изменяем -> отдаем браузеру

import { chromium } from '@playwright/test';
import { join } from 'node:path';

run();

async function run() {
    const chromiumPath = join('C:', 'chrome-win140', 'chrome.exe');
    const browser = await chromium.launch({ executablePath: chromiumPath, headless: false });
    const page = await browser.newPage();
    // работают текстовые маски - page.route('**/*')
    page.route(
        (url) => {
            return true;
        },
        async (route, request) => {
            const queryParams = new URL(request.url()).searchParams;
            const wordForHints = 'react';
            if (queryParams.get('part') === wordForHints) {
                const response = await route.fetch();
                const data = await response.json();
                // yandex search hints
                data[1] = fakeResponseHints;
                await route.fulfill({
                    response,
                    body: JSON.stringify(data),
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
    [
        '',
        'VueJs намного лучше',
        {
            'sg_weight': 0,
            'log': ['fulltext', 'none', 'b'],
            'hl': [[0, 1]],
        },
    ],
    [
        '',
        'use VueJs instead',
        {
            'pers': 1,
            'sg_weight': 0,
            'log': ['fulltext', 'history', 'pers'],
            'hl': [[0, 1]],
        },
    ],
];
