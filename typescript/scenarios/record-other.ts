/** 
  * Does not provide `executablePath` - Playwright-team(thanks you) makes
  * patched Firefox-build for testing https://playwright.dev/docs/browsers#firefox 
  * */

import { firefox, selectors } from '@playwright/test';
import { join } from 'node:path';

const dirname = import.meta.dirname;
async function run() {
	const browser = await firefox.launch({
		// const browser = await webkit.launch({
		headless: false,
		// складывается с showAction#duration
		slowMo: 1000,

	});

	// ctx.tracing.stop({ path: join(`trace-${Temporal.PlainTime.toString()}.zip`) });

	const context = await browser.newContext({
		// recordHar: { path: join('..', 'log.har') },
		// // запись видео начинается сразу - webkit/firefox
		// recordVideo: {
		// 	dir: join(dirname, 'video'),
		// 	size: {
		// 		width: 1920,
		// 		height: 1080
		// 	}, 
		// 	showActions: {
		// 		duration: 1000,
		// 	},
		// },
	});

	// context.tracing.start({});
	const page = await context.newPage();

	let currentVideoPath: string | null = null;


	// firefox - work, webkit - no??? 
	await page.exposeFunction('startVideo', async () => {
		const fileName = `_video_.webm`;
		const filePath = join(dirname, fileName);

		currentVideoPath = filePath;
		await page.screencast.start({
			path: filePath,
			// onFrame: ({ data, timestamp, viewportWidth, viewportHeight }) => {
			// 	console.log(`frame size: ${data.length} (${viewportWidth}x${viewportHeight}) at ${timestamp}`);
			// },
			size: { width: 1280, height: 800 },
		});

		return { started: true, file: fileName };
	});

	await page.exposeFunction('stopVideo', async () => {
		if (!currentVideoPath) {
			return { error: 'Video was not started' };
		}

		await page.screencast.stop();

		const saved = currentVideoPath;
		currentVideoPath = null;

		return { stopped: true, file: saved };
	});

	await page.exposeFunction('makeScreenshot', async () => {
		const fileName = `screenshot_${performance.now()}.png`;
		const filePath = join(dirname, fileName);

		// с конкретного элемента
		await page.locator('//').screenshot();
		// await page.screenshot({ path: filePath });

		return { saved: fileName };
	});

	// await page.exposeFunction('makeSnapshotRaw', async () => {
	//     const fileName = `snapshot_${performance.now()}.html`;
	//     const filePath = join(dirname, fileName);

	//     const cdp = await context.newCDPSession(page);
	//     // снимок DOM 
	//     const { data } = await cdp.send('Page.captureSnapshot');
	//     await writeFile(filePath, data);
	//     return { saved: fileName };
	// });

	await page.exposeFunction('makePdf', async (fileName?: string) => {
		const name = fileName ?? `page_${performance.now()}.pdf`;
		const filePath = join(dirname, name);

		await page.pdf({
			path: filePath,
			format: 'A4', // 'Letter' | 'A4' | 'A3' или { width, height }
			printBackground: true,
			margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },

		});

		return { saved: name, path: filePath };
	});

	let currentHarRecording: any;
	await page.exposeFunction('startHar', async (fileName?: string) => {
		if (currentHarRecording) {
			throw new Error('HAR already started — call stopHar() first');
		}
		const name = fileName ?? `traffic_${performance.now()}.har`;
		const filePath = join(name);
		currentHarRecording = await context.tracing.startHar(filePath);

		// можно подменить ответы из сохраненного .har
		// https://playwright.dev/docs/mock#replaying-from-har
		// page.routeFromHAR('', { notFound: 'abort' })
	});

	await page.exposeFunction('clickAction', async (event: null | string, click = false) => {
		const locator = event ? `css=[data-test-id="${event}"]` : 'css=html';
		if (click) {
			await page.evaluate(() => {
				(window as any).pwClicked = true;
			});
			await page.click(locator);
		} else {
			// имитация действия для записи в trace
			await page.locator(locator).evaluate(() => void 0);
		}
	});

	await page.exposeFunction('stopHar', async () => {
		if (!currentHarRecording) {
			return;
		}
		await currentHarRecording.dispose();
		currentHarRecording = null;
	});


	let isTraceRecording: boolean = false;
	await page.exposeFunction('startTrace', async () => {
		if (isTraceRecording) {
			throw new Error('Trace already started — call stopTrace() first');
		}

		isTraceRecording = true;
		// перехватываем клики и выполняем на pw стороне, таким образом получаем снэпшоты
		await page.evaluate(() => {
			window.addEventListener('click',
				async (ev) => {
					if ((window as any).pwClicked) {
						(window as any).pwClicked = false;
						return;
					}

					const target = ev.target as HTMLElement;
					const clickByPw = true;
					if (clickByPw) {
						ev.preventDefault();
						ev.stopImmediatePropagation();
					}

					(window as any).clickAction(target.getAttribute('data-test-id'), clickByPw);
				},
				{ capture: true }
			);
		});
		await context.tracing.start({
			screenshots: true,
			// полноценное DOM дерево в моменты, записывается только для момента действий через `page`
			snapshots: true,
			sources: true,
			name: 'test-trace',
		});
	});

	await page.exposeFunction('stopTrace', async (fileName?: string) => {
		if (!isTraceRecording) {
			return;
		}
		const name = fileName ?? `trace_${performance.now()}.zip`;
		await context.tracing.stop({ path: join(dirname, 'artifacts', name) });
		isTraceRecording = false;
	});

	selectors.setTestIdAttribute('data-test-id');
	await page.goto('file:///' + join(dirname, '..', 'index.html'));


	// посмотреть полноценный трейс можно только при записи действиями через `page` или перехватывая действия
	// и делая имитацию actions на playwright стороне
	// await context.tracing.start({
	// 	screenshots: true,
	// 	sources: true,
	// 	snapshots: true,
	// });
	// await page.getByTestId('simple-log').click();
	// await page.getByTestId('simple-input').pressSequentially('asdasdvv', { delay: 1000 });
	// await page.getByTestId('simple-log').click();

	// await context.tracing.stop({ path: './ttt.zip' });

	// await context.close();
	// await browser.close();
}

run();