import { chromium } from '@playwright/test';
import { join } from 'node:path';
import { emptyProfileDir } from '../scripts/empty-profile-dir';

run();

async function run() {
    const chromiumPath = join('C:', 'chrome', 'chrome.exe');
    const testProfilePath = join('C:', 'tmp_user_dir');
    await emptyProfileDir(testProfilePath);

    // можно сохранять профиль
    // const browser = await chromium.launchPersistentContext(testProfilePath, {
    const browser = await chromium.launch({
        /** игнорирует флаги браузера выставленные Playwright*/
        ignoreDefaultArgs: false,
        // args: [
        //     /** this flag is responsible for the launch with `navigator.webdriver = true` */
        //     '--remote-debugging-pipe',
        // ],
        /** path to a concrete browser*/
        executablePath: chromiumPath,
        /** show browser */
        headless: false,
    });

    const page = await browser.newPage();
    await page.goto('http://google.com');
}

/**
 * Defaults flags
 * --disable-field-trial-config	Отключает A/B-тесты и эксперименты (Field Trials) — Chrome не будет загружать конфиги для тестирования новых фич
 * --disable-background-networking	Блокирует фоновые сетевые запросы (обновления, пинг сервисов) — уменьшает нагрузку на сеть
 * --disable-background-timer-throttling	Отключает замедление таймеров в фоне — фоновые скрипты работают быстрее
 * --disable-backgrounding-occluded-windows	Отключает приостановку вкладок в скрытых окнах — вкладки не засыпают
 * --disable-back-forward-cache	Отключает BFCache (кэш навигации) — страница не кэшируется для быстрого back/forward
 * --disable-breakpad	Отключает сборку минидампов при падении — не отправляет отчёты в Google
 * --disable-client-side-phishing-detection	Отключает проверку на фишинг на стороне клиента
 * --disable-component-extensions-with-background-pages	Блокирует расширения с фоновыми страницами
 * --disable-component-update	Отключает автоматическое обновление компонентов (Widevine, CRLSets, Hints и пр.)
 * --disable-edgeupdater	Отключает апдейтер Edge (хотя это Chromium, флаг есть для совместимости)
 * --disable-features=...	Массив отключённых фич: AutoDeElevate, BoundaryEventDispatchTracksNodeRemoval,
 *                       DestroyProfileOnBrowserClose, DialMediaRouteProvider,
 *                        GlobalMediaControls, HttpsUpgrades, LensOverlay, MediaRouter, PaintHolding,
 *                         ThirdPartyStoragePartitioning, Translate, RenderDocument, OptimizationHints,
 *                          msForceBrowserSignIn, msEdgeUpdateLaunchServicesPreferredVersion
 */
