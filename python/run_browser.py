import socket
import subprocess
import sys
import time
from dataclasses import dataclass, field


@dataclass
class BrowserOptions:
    """Параметры запуска браузера как отдельного процесса."""

    chromium_path: str
    test_profile_path: str
    resource: str = ""
    args: list[str] = field(default_factory=list)


def run_browser(opts: BrowserOptions) -> subprocess.Popen:
    """
    Запускает Chromium как отдельный процесс с включённым CDP-портом.
    - Подключение к уже запущенному браузеру через connect_over_cdp.
    - Использование постоянного профиля (куки, localStorage, расширения).
    - Возможность отладки тестов в реальном браузере.
    """
    cmd = [
        opts.chromium_path,
        f"--user-data-dir={opts.test_profile_path}",
        "--remote-debugging-port=9222",
        # "--auto-open-devtools-for-tabs",
        *opts.args,
    ]

    # Если ресурс не задан, не добавляем пустую строку в аргументы
    if opts.resource:
        cmd.append(opts.resource)

    if sys.platform == "win32":
        return subprocess.Popen(
            cmd,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
        )
    else:
        # Unix-путь
        return subprocess.Popen(
            cmd,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )


def wait_for_cdp(port: int = 9222, timeout: float = 10.0) -> None:
    """
    Ждём, пока браузер поднимет CDP-порт.
    Без этого connect_over_cdp может упасть с ConnectionRefusedError.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return
        except OSError:
            time.sleep(0.1)
    raise TimeoutError(f"CDP port {port} is not available after {timeout}s")
