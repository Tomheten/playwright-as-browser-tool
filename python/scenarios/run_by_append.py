import json
from pathlib import Path

from playwright.sync_api import sync_playwright

### CDP INFO https://chromedevtools.github.io/devtools-protocol/

def run():
    DEBUGGING_PORT = 9222
    CDP_URL = f"http://localhost:{DEBUGGING_PORT}"
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(CDP_URL)
        context = browser.contexts[0]
        page = context.pages[0]

        cdp = context.new_cdp_session(page)
        browser_cdp = browser.new_browser_cdp_session()

        page.pause()

        input("Input Enter...")

        cdp.detach()
        context.close()
        browser.close()

if __name__ == "__main__":
    run()
