import json
import platform
import re
import shutil
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

DEBUGGING_PORT = 9222
CDP_URL = f"http://localhost:{DEBUGGING_PORT}"


def open_chrome_version_page(context) -> dict:
    """
    Открываем chrome://version и парсим страницу.
    """
    page = context.new_page()
    page.goto("chrome://version")
    page.pause()


def get_installed_extensions(cdp) -> list[dict]:
    """
    Получаем список установленных расширений через Target.getTargets().

    Расширения в Chrome — это отдельные targets с типами:
    - service_worker (Manifest V3)
    - background_page (Manifest V2)
    - iframe (вспомогательные страницы расширений)

    URL у них всегда начинается с chrome-extension://<extension-id>/
    """
    result = cdp.send("Target.getTargets")
    targets = result.get("targetInfos", [])

    extensions: dict[str, dict] = {}  # id -> info, чтобы убрать дубликаты

    for target in targets:
        url = target.get("url", "")
        if not url.startswith("chrome-extension://"):
            continue

        # Извлекаем ID расширения из URL: chrome-extension://<id>/...
        ext_id = url.split("/")[2]

        if ext_id not in extensions:
            extensions[ext_id] = {
                "id": ext_id,
                "name": target.get("title") or "unknown",
                "types": set(),
                "urls": [],
            }
        extensions[ext_id]["types"].add(target.get("type", "unknown"))
        extensions[ext_id]["urls"].append(url)

    # Преобразуем set в list для JSON-сериализации
    for ext in extensions.values():
        ext["types"] = sorted(ext["types"])

    return list(extensions.values())


def get_cpu_info() -> str:
    """
    Кроссплатформенный сбор информации о CPU.
    """
    system = platform.system()

    if system == "Windows":
        try:
            # PowerShell быстрее и надёжнее wmic (wmic deprecated в новых Windows)
            result = subprocess.run(
                [
                    "powershell",
                    "-Command",
                    "Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed | Format-List",
                ],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return result.stdout.strip()
        except Exception:
            return "CPU info unavailable on Windows"

    elif system == "Darwin":  # macOS
        try:
            result = subprocess.run(
                ["sysctl", "-n", "machdep.cpu.brand_string"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            cores = subprocess.run(
                ["sysctl", "-n", "hw.ncpu"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return f"CPU: {result.stdout.strip()}\nCores: {cores.stdout.strip()}"
        except Exception:
            return "CPU info unavailable on macOS"

    else:  # Linux
        try:
            # Читаем /proc/cpuinfo — самый надёжный способ
            with open("/proc/cpuinfo", "r") as f:
                lines = f.readlines()
            # Берём только уникальные поля: model name, cpu cores
            relevant = []
            seen = set()
            for line in lines:
                if ":" in line:
                    key = line.split(":")[0].strip()
                    if (
                        key in ("model name", "cpu cores", "siblings")
                        and key not in seen
                    ):
                        relevant.append(line.strip())
                        seen.add(key)
            return "\n".join(relevant)
        except Exception:
            return "CPU info unavailable on Linux"


def get_system_info() -> dict:
    """Базовая информация об ОС и Python."""
    return {
        "python_version": sys.version.split()[0],
        "platform": platform.platform(),
        "architecture": platform.machine(),
        "hostname": platform.node(),
    }


def run():

    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP_URL)

        # Browser-level CDP — информация о самом браузере
        browser_cdp = browser.new_browser_cdp_session()

        # Информация о системе
        cpu_info = get_cpu_info()
        sys_info = get_system_info()

        # Информация о браузере через CDP
        browser_version = browser_cdp.send("Browser.getVersion")

        extensions = get_installed_extensions(browser_cdp)
        print(f"Установлено расширений: {len(extensions)}")
        print("=" * 60)
        for ext in extensions:
            print(f"\n📦 {ext['name']}")
            print(f"   ID:   {ext['id']}")
            print(f"   Типы: {', '.join(ext['types'])}")

        # open_chrome_version_page(browser.contexts[0])

        # === Формируем отчёт ===
        report_lines = [
            f"# Environment Report",
            f"",
            f"## System Info",
            f"",
        ]
        for key, value in sys_info.items():
            report_lines.append(f"- **{key}**: `{value}`")

        report_lines.extend(
            [
                f"",
                f"## CPU Info",
                f"",
                f"```",
                cpu_info,
                f"```",
                f"",
                f"## Browser Info",
                f"",
                f"```json",
                json.dumps(browser_version, indent=2),
                f"```",
            ]
        )

        # Сохраняем в файл
        output_path = Path("env.md")
        output_path.write_text("\n".join(report_lines), encoding="utf-8")

        print(f"Отчёт сохранён: {output_path.absolute()}")
        print(f"Размер: {output_path.stat().st_size} bytes")

        browser.close()


if __name__ == "__main__":
    run()
