# Диаграмма 1: Стандартный запуск Playwright

```mermaid
flowchart LR
    subgraph Test_Script ["📝 Тестовый скрипт Python/TS"]
        PW["Playwright Core API"]
    end

    subgraph OS ["⚙️ Операционная система"]
        Browser["🌐 Процесс Браузера Chromium"]
    end

    PW -->|"1. chromium.launch с флагами"| Browser
    Browser -->|"2. Запуск с флагами"| OS
    
    PW <-->|"3. WebSocket CDP Полный контроль"| Browser
    
    PW -->|"4. browser.close Процесс уничтожается"| Browser

    classDef script fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef browser fill:#fff3e0,stroke:#e65100,stroke-width:2px
    class Test_Script,PW script
    class OS,Browser browser
```