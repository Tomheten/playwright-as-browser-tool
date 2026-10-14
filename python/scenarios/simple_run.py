import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright


def empty_profile_dir(profile_path: str) -> None:
    path = Path(profile_path)
    if path.exists() and path.is_dir():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def run():
    chromium_path = r"/home/Tomheten/chrome-linux64/chrome"
    test_profile_path = r"/home/Tomheten/tmp_user_dir"

    empty_profile_dir(test_profile_path)

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
            ignore_default_args=False,
            executable_path=chromium_path,
            headless=False,
        )

        page = browser.new_page()
        page.goto("http://google.com")

        input("Input Enter...")
        browser.close()


if __name__ == "__main__":
    run()
