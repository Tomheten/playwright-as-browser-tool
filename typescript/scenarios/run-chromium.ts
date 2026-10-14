import { join } from 'node:path';
import { runBrowser } from '../scripts/run-browser';

const testProfilePath = join('C:', 'tmp_user_dir');

const chromiumPath = join('C:', 'chrome-win', 'chrome.exe');
const resource = 'https://google.com';

runBrowser({
    chromiumPath,
    testProfilePath,
    resource,
});
