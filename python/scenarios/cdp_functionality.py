import json
from pathlib import Path

from playwright.sync_api import sync_playwright

### CDP INFO https://chromedevtools.github.io/devtools-protocol/

DEBUGGING_PORT = 9222
CDP_URL = f"http://localhost:{DEBUGGING_PORT}"


def extract_readable_dom(snapshot: dict) -> str:
    """
    Преобразует сырой CDP-снапшот в читаемый текст.
    """
    strings = snapshot["strings"]
    lines = []

    for doc_idx, doc in enumerate(snapshot["documents"]):
        lines.append(
            f"\n=== Document {doc_idx}: {doc.get('documentURL', 'unknown')} ===\n"
        )

        nodes = doc["nodes"]
        node_types = nodes.get("nodeType", [])
        node_names = nodes.get("nodeName", [])
        node_values = nodes.get("nodeValue", [])

        for i in range(len(node_types)):
            node_type = node_types[i]

            # Element (1) или Text (3)
            if node_type == 1:
                tag_name = strings[node_names[i]] if i < len(node_names) else "?"
                lines.append(f"[{i}] <{tag_name}>")
            elif node_type == 3:
                text = strings[node_values[i]] if i < len(node_values) else ""
                if text.strip():
                    lines.append(f"[{i}]   text: {text[:50]}")

    return "\n".join(lines)


def run():
    with sync_playwright() as p:
        # Подключаемся к уже запущенному браузеру
        browser = p.chromium.connect_over_cdp(CDP_URL)

        # Берём первый контекст и первую страницу (они остались от запуска)
        context = browser.contexts[0]
        page = context.pages[0]

        # Открываем CDP-сессию на уровне страницы
        # Это прямой доступ к Chrome DevTools Protocol
        cdp = context.new_cdp_session(page)

        # Проверяем, что Playwright действительно прицепился к странице
        page.evaluate("() => console.log('------------- playwright is attached')")

        # Открываем CDP-сессию на уровне всего браузера (а не одной страницы)
        browser_cdp = browser.new_browser_cdp_session()

        # DOMSnapshot даёт дерево с computed styles, layout-боксами и т.д.
        cdp.send("DOMSnapshot.enable")
        snapshot = cdp.send("DOMSnapshot.captureSnapshot", {"computedStyles": []})
        print(
            f"--- DOM snapshot: {len(snapshot['documents'])} документов, "
            f"{len(snapshot['strings'])} уникальных строк"
        )

        output_path = Path("dom_snapshot.json")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(extract_readable_dom(snapshot))

        # 2. Информация о самом браузере
        browser_info = browser_cdp.send("Browser.getVersion")
        print("--- browser info ---")
        for key, value in browser_info.items():
            print(f"  {key}: {value}")

        page.pause()

        input("Input Enter...")
        # browser.close() при connect_over_cdp НЕ убивает процесс браузера,
        # а только отключается от него. Сам Chromium останется висеть.
        cdp.detach()
        context.close()
        browser.close()


if __name__ == "__main__":
    run()
