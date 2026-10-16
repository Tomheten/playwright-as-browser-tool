import asyncio
from pathlib import Path

from playwright.async_api import Page, Playwright, async_playwright

ARTIFACTS_DIR = Path("artifacts")
ARTIFACTS_DIR.mkdir(exist_ok=True)


async def run(playwright: Playwright):
    chromium_path = "/home/Tomheten/chrome-linux64/chrome"
    browser = await playwright.chromium.launch(
        executable_path=chromium_path,
        headless=False,
        slow_mo=1000,
    )

    context = await browser.new_context(
        # record_har_path=str(ARTIFACTS_DIR / "log.har"),
        # Запись видео начинается сразу
        # record_video_dir=str(ARTIFACTS_DIR / "video"),
        # record_video_size={"width": 1280, "height": 800},
        # show_actions в Python отсутствует напрямую, но есть через CDP
    )

    # context.tracing.start({})
    page: Page = await context.new_page()

    current_video = {"path": None, "controller": None}

    async def start_video():
        file_name = f"video_{int(await page.evaluate('performance.now()'))}.webm"
        file_path = str(ARTIFACTS_DIR / file_name)

        current_video["path"] = file_path

        current_video["controller"] = await page.screencast.start(
            path=file_path,
            size={"width": 1280, "height": 800},
        )

        return {"started": True, "file": file_name}

    async def stop_video():
        if not current_video["path"]:
            return {"error": "Video was not started"}

        await current_video["controller"].dispose()

        saved = current_video["path"]
        current_video["path"] = None
        current_video["controller"] = None

        return {"stopped": True, "file": saved}

    await page.expose_function("startVideo", start_video)
    await page.expose_function("stopVideo", stop_video)

    async def make_screenshot():
        file_name = f"screenshot_{int(await page.evaluate('performance.now()'))}.png"
        file_path = ARTIFACTS_DIR / file_name

        # с конкретного элемента
        await page.locator("//").screenshot(path=str(file_path))
        # await page.screenshot(path=str(file_path))

        return {"saved": file_name}

    await page.expose_function("makeScreenshot", make_screenshot)

    # async def make_snapshot_raw():
    #     file_name = f"snapshot_{int(await page.evaluate('performance.now()'))}.html"
    #     file_path = ARTIFACTS_DIR / file_name
    #
    #     cdp = await context.new_cdp_session(page)
    #     # Снимок DOM
    #     result = await cdp.send("Page.captureSnapshot")
    #     data = result.get("data", "")
    #     file_path.write_text(data, encoding="utf-8")
    #     return {"saved": file_name}
    #
    # await page.expose_function("makeSnapshotRaw", make_snapshot_raw)

    async def make_pdf(file_name: str = None):
        name = file_name or f"page_{int(await page.evaluate('performance.now()'))}.pdf"
        file_path = ARTIFACTS_DIR / name

        await page.pdf(
            path=str(file_path),
            format="A4",  # 'Letter' | 'A4' | 'A3' или { width, height }
            print_background=True,
            margin={
                "top": "20mm",
                "bottom": "20mm",
                "left": "15mm",
                "right": "15mm",
            },
        )

        return {"saved": name, "path": str(file_path)}

    await page.expose_function("makePdf", make_pdf)

    current_har_recording = {"recording": None}
    async def start_har(file_name: str = None):
        # Аналог: if (currentHarRecording) { throw new Error(...) }
        if current_har_recording["recording"]:
            raise Exception("HAR already started — call stopHar() first")

        time = int(await page.evaluate("performance.now()"))
        name = file_name or f"traffic_{time}.har"
        file_path = ARTIFACTS_DIR / name

        current_har_recording["recording"] = await context.tracing.start_har(
            str(file_path)
        )
        # можно подменить ответы из сохраненного .har
        # https://playwright.dev/docs/mock#replaying-from-har
        # await page.route_from_har("", not_found="abort")

    async def stop_har():
        """Останавливает запись HAR."""
        if not current_har_recording["recording"]:
            return

        # Аналог: await currentHarRecording.dispose(); currentHarRecording = null;
        await current_har_recording["recording"].dispose()
        current_har_recording["recording"] = None

    await page.expose_function("startHar", start_har)
    await page.expose_function("stopHar", stop_har)

    async def click_action(event: str = None, click: bool = False):
        locator = f'css=[data-test-id="{event}"]' if event else "css=html"

        if click:
            await page.evaluate("() => { window.pwClicked = true; }")
            await page.click(locator)
        else:
            await page.locator(locator).evaluate("() => void 0")

    await page.expose_function("clickAction", click_action)

    is_trace_recording = {"value": False}

    async def start_trace():
        if is_trace_recording["value"]:
            raise Exception("Trace already started — call stopTrace() first")

        is_trace_recording["value"] = True

        # Перехватываем клики и выполняем на pw стороне, таким образом получаем снэпшоты
        # await page.evaluate("""
        #     () => {
        #         window.addEventListener('click',
        #             async (ev) => {
        #                 if (window.pwClicked) {
        #                     window.pwClicked = false;
        #                     return;
        #                 }
        
        #                 const target = ev.target;
        #                 const clickByPw = true;
        #                 if (clickByPw) {
        #                     ev.preventDefault();
        #                     ev.stopImmediatePropagation();
        #                 }
        
        #                 window.clickAction(target.getAttribute('data-test-id'), clickByPw);
        #             },
        #             { capture: true }
        #         );
        #     }
        # """)

        await context.tracing.start(
            screenshots=True,
            # Полноценное DOM-дерево в моменты, записывается только для момента действий через `page`
            snapshots=True,
            sources=True,
            name="test-trace",
        )

    async def stop_trace(file_name: str = None):
        if not is_trace_recording["value"]:
            return

        name = file_name or f"trace_{int(await page.evaluate('performance.now()'))}.zip"
        traces_dir = ARTIFACTS_DIR / "traces"
        traces_dir.mkdir(exist_ok=True)

        await context.tracing.stop(path=str(traces_dir / name))
        is_trace_recording["value"] = False

    await page.expose_function("startTrace", start_trace)
    await page.expose_function("stopTrace", stop_trace)

    playwright.selectors.set_test_id_attribute("data-test-id")
    html_path = Path(__file__).parent.parent.parent / "index.html"
    await page.goto(html_path.as_uri())

    # Посмотреть полноценный трейс можно только при записи действиями через `page`
    # или перехватывая действия и делая имитацию actions на playwright стороне
    # await context.tracing.start({
    #     screenshots=True,
    #     sources=False,
    #     snapshots=False,
    # })

    # await page.get_by_test_id("simple-log").click()
    # await page.get_by_test_id("simple-input").press_sequentially("asdasdvv", delay=1000)
    # await page.get_by_test_id("simple-log").click()

    # await context.tracing.stop(path="./ttt.zip")

    await asyncio.to_thread(input, "Нажми Enter для закрытия браузера...")
    await context.close()
    await browser.close()


async def main():
    async with async_playwright() as playwright:
        await run(playwright)


if __name__ == "__main__":
    asyncio.run(main())
