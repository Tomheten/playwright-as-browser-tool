import shutil
from pathlib import Path

from run_browser import BrowserOptions, run_browser, wait_for_cdp


def run():
    chromium_path = r"/home/Tomheten/chrome-linux64/chrome"
    test_profile_path = r"/home/Tomheten/tmp_user_dir"

    # URL для открытия при запуске
    resource = "https://google.com"

    # Создаём конфигурацию запуска
    opts = BrowserOptions(
        chromium_path=str(chromium_path),
        test_profile_path=str(test_profile_path),
        resource=resource,
    )

    # Запускаем браузер
    proc = run_browser(opts)
    print("Браузер запущен. CDP доступен на порту 9222.")
    input("Input Enter...")


if __name__ == "__main__":
    run()
