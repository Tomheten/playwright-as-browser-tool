import { spawn } from 'node:child_process';

export function runBrowser(opts: {
    chromiumPath: string;
    testProfilePath: string;
    resource?: string;
}) {
    /** run browser with empty new-profile */
    spawn(opts.chromiumPath, [
        `--user-data-dir=${opts.testProfilePath} `,
        `--remote-debugging-port=9222 `,
        `${opts.resource ?? ''}`,
    ], { stdio: 'inherit', detached: true });
}

