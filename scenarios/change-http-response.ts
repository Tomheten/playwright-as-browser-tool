// suggest-ya.cgi - смотри query - `part`, в начале пример на подмену заготовленным моком, потом показать подмену через иземенени реального ответа
// fetch -> изменяем -> отдаем браузеру

import { chromium } from '@playwright/test';
import { join } from 'node:path';

run();

const chromiumPath = join('C:', 'chrome-win140', 'chrome.exe');
const browser = await chromium.launch({ executablePath: chromiumPath, headless: false });
async function run() {

    const page = await browser.newPage();
    // page.route()

    // ???? простые  примеры для 'Request' 'Response'

    await page.goto('http://yandex.ru');
}
