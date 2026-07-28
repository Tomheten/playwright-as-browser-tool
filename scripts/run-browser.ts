import { spawn } from 'node:child_process';
import { platform } from 'node:os';

export function runBrowser(opts: {
    chromiumPath: string;
    testProfilePath: string;
    resource?: string;
    /** additional browser flags */
    args?: string[];
}) {
    if (platform() === 'win32') {
        spawn(opts.chromiumPath, [
            ` --user-data-dir=${opts.testProfilePath} `,
            ` --remote-debugging-port=9222 `,
            ...(opts?.args ?? []),
            `${opts.resource ?? ''}`,
        ], { stdio: 'inherit', detached: true });
    }
}
