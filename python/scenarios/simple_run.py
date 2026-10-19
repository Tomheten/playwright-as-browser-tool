import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

def run():
    chromium_path = r"C:/chrome-win/chrome.exe"

    with sync_playwright() as p:
        # --- Вариант с сохранением профиля (Persistent Context) ---
        # browser = p.chromium.launch_persistent_context(
        #     test_profile_path,
        #     ignore_default_args=False,
        #     executable_path=chromium_path,
        #     headless=False,
        # )
        # page = browser.new_page()
        # ----------------------------------------------------------

        # --- Обычный запуск ---
        browser = p.chromium.launch(
            executable_path=chromium_path,
            headless=False,
        )

        page = browser.new_page()
        page.goto("http://google.com")

        input("Input Enter...")
        browser.close()


if __name__ == "__main__":
    run()
