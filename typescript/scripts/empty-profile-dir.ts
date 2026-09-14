import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

export async function emptyProfileDir(testProfilePath: string) {
    const chromiumProfileDirs = await readdir(testProfilePath);
    await Promise.all(chromiumProfileDirs.map(n => rm(join(testProfilePath, n), { recursive: true, force: true })));
}
