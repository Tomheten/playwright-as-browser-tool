import asyncio
import json
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.async_api import Playwright, async_playwright

#  запустить браузер с флагом ` --remote-debugging-port=9222 `, перейти на `https://ya.ru/search`
#  потом эту функцию запускаем


ARTIFACTS_DIR = Path("artifacts")
ARTIFACTS_DIR.mkdir(exist_ok=True)


async def run(playwright: Playwright):
    browser = await playwright.chromium.connect_over_cdp("http://localhost:9222")

    first_ctx = browser.contexts[0]
    pages = first_ctx.pages
    page = pages[0]

    ts = int(await page.evaluate("performance.now()"))
    file_name = f"video_{ts}.webm"
    file_path = ARTIFACTS_DIR / file_name

    fake_response_hints = [
        "react",
        [
            [
                "",
                "VueJs намного лучше",
                {
                    "sg_weight": 0,
                    "log": ["fulltext", "none", "b"],
                    "hl": [[0, 10]],
                },
            ],
            [
                "",
                "use VueJs instead",
                {
                    "pers": 1,
                    "sg_weight": 0,
                    "log": ["fulltext", "history", "pers"],
                    "hl": [[0, 3]],
                },
            ],
        ],
        {"r": 10174, "pers_options": 1, "log": "sgtype:BBBBBBBBBB", "continue": "tion"},
    ]

    async def route_handler(route, request):
        parsed_url = urlparse(request.url)
        query_params = parse_qs(parsed_url.query)

        word_for_hints = "react"

        if query_params.get("part") == [word_for_hints]:
            """
            можно послать запрос на сервер и подменить уже ответ,
            но могут быть проблемы с серверными проверками запроса
            """
            # response = await route.fetch()
            await route.fulfill(body=json.dumps(fake_response_hints))
        else:
            await route.continue_()

    # "**/*" означает перехват всех запросов (аналог (url) => true)
    await page.route("**/*", route_handler)

    # автоматически запишет видео
    # screencast = await page.screencast.start(
    #     path=str(file_path),
    #     size={
    #         "width": 1280,
    #         "height": 800,
    #     },
    # )
    # input_search = page.get_by_role("combobox")
    # await input_search.click()
    # await input_search.press_sequentially("react", delay=650)
    # await page.wait_for_timeout(3000)
    # await screencast.dispose()

    await asyncio.to_thread(input, "Нажми Enter для закрытия браузера...")
    await first_ctx.close()
    await browser.close()

async def main():
    async with async_playwright() as p:
        await run(p)


if __name__ == "__main__":
    asyncio.run(main())
