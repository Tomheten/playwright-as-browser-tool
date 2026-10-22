import subprocess


def run():
    chromium_path = r"C:/chrome-win/chrome.exe"
    test_profile_path = r"C:/tmp_user_dir"
    # URL для открытия при запуске
    resource = "https://google.com"

    subprocess.Popen(
        [
            chromium_path,
            "--remote-debugging-port=9222",
            f"--user-data-dir={test_profile_path}",
            # "--auto-open-devtools-for-tabs",
            # "--ignore",
            # resource,
        ]
    )
    print("Браузер запущен. CDP доступен на порту 9222.")
    input("Input Enter...")


if __name__ == "__main__":
    run()
