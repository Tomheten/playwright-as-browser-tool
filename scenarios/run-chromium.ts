import { join } from 'node:path';
import { runBrowser } from '../scripts/run-browser';

const testProfilePath = join('C:', 'browser-profile-tmp');
const chromiumPath = join('C:', 'chrome-w', 'chrome.exe');
// const resource = 'https://accounts.google.com';
const resource = 'https://sbermarket.ru';

runBrowser({
    chromiumPath,
    testProfilePath,
    resource,
});
