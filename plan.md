1) коротко про 2 части доклада: 1 - самые практические примеры, 2 - продвинутые вещи, примеры из кода playwright --- ?? ссылки-описание на скрипы
2) коротко про проект: смотрим на package.json, где примеры, как запускать, где репа.
3) Коротко про cdp, прямой запуск страницы -
                               https://developer.chrome.com/blog/new-in-devtools-92?utm_source=devtools&utm_campaign=stable&hl=en#protocol-monitor
                               https://chromedevtools.github.io/devtools-protocol/
                               
4) CDP-сервер — это реализация Chrome DevTools Protocol внутри Chromium \
CDP (Chrome DevTools Protocol) — это протокол, которым Chromium управляет через отладку. Это не отдельный сервис, а набор HTTP/WebSocket API, встроенный в браузер. \
Как это работает: \
Chromium запускает CDP-сервер — он слушает входящие подключения (по pipe или TCP-порту)
Playwright подключается к CDP-серверу через WebSocket -> Playwright отправляет команды (JSON) и получает ответы (JSON) -> Chromium выполняет команды и возвращает результат \
Пример команды CDP
```json
// Playwright отправляет:
{
  "id": 1,
  "method": "Page.navigate",
  "params": { "url": "https://example.com" }
}

// Chromium отвечает:
{
  "id": 1,
  "result": { "frameId": "..." }
}
```
Как Playwright подключается: 
Pipe: Chromium создаёт OS-канал, Playwright подключается к нему напрямую
Port: Chromium открывает TCP-порт (обычно 9222), Playwright подключается через WebSocket                               

