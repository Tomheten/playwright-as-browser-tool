import asyncio
import json
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.async_api import Playwright, async_playwright

ARTIFACTS_DIR = Path("artifacts")
ARTIFACTS_DIR.mkdir(exist_ok=True)

async def run(playwright: Playwright):
    browser = await playwright.chromium.connect_over_cdp("http://localhost:9222")

    # Ищем именно ту страницу, где открыт Яндекс, а не берем первую попавшуюся
    target_page = None
    for ctx in browser.contexts:
        for p in ctx.pages:
            if "yandex" in p.url or "ya.ru" in p.url:
                target_page = p
                break
        if target_page:
            break

    if not target_page:
        print("❌ Не найдена страница с Яндексом! Убедитесь, что вкладка открыта.")
        return

    print(f"✅ Найдена целевая страница: {target_page.url}")
    page = target_page

    fake_response_hints = [
        "selenium",
        [
            ["", "Выбрось старье!", {"sg_weight": 0, "log": ["fulltext", "none", "b"], "hl": [[0, 10]]}],
            ["", "Будь современным!..", {"pers": 1, "sg_weight": 0, "log": ["fulltext", "history", "pers"], "hl": [[0, 3]]}],
        ],
        {"r": 10174, "pers_options": 1, "log": "sgtype:BBBBBBBBBB", "continue": "tion"},
    ]

    async def route_handler(route, request):
        url = request.url
        
        parsed_url = urlparse(url)
        query_params = parse_qs(parsed_url.query)

        if query_params.get("part") == ["selenium"]:
            await asyncio.sleep(7) 
            await route.fulfill(
                body=json.dumps(fake_response_hints),
                content_type="application/json"  # !!! УЛУЧШЕНИЕ 3: Обязательно указываем тип контента, иначе браузер может игнорировать ответ
            )
        else:
            await route.continue_()

    # Регистрируем роутер
    await page.route("**/*", route_handler)

    # Ждем действия пользователя
    # await asyncio.to_thread(input, "Нажми Enter для закрытия браузера...")
    
    # автоматически запишет видео
    file_name = f"video_vuejs.webm"
    file_path = ARTIFACTS_DIR / file_name
    screencast = await page.screencast.start(
        path=str(file_path),
        size={
            "width": 1280,
            "height": 800,
        },
    )
    input_search = page.get_by_role("combobox")
    await input_search.click()
    await input_search.press_sequentially("selenium", delay=650)
    await page.wait_for_timeout(3000)
    await screencast.dispose()


    # # Очистка
    # await page.unroute_all()
    # await browser.close()

async def main():
    async with async_playwright() as p:
        await run(p)

if __name__ == "__main__":
    asyncio.run(main())