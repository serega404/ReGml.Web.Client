![Frame 39264](https://github.com/user-attachments/assets/dd3d0f5d-3b19-496f-ac52-8547566103bc)

# Gml.Web.Client

Статический веб-клиент Gml Launcher на Next.js. Приложение собирается в HTML, CSS и JavaScript,
а данные получает в браузере из Gml backend.

## Требования

- Node.js 20+
- npm
- доступный Gml backend

## Локальная разработка

```bash
npm ci
npm run dev
```

Dev-сервер доступен на `http://localhost:3000`.

## Статическая сборка

```bash
npm ci
npm run build:static
```

Next.js создаёт готовый к публикации каталог `out/`. Команда также проверяет наличие основных
HTML-файлов экспорта. Для production-запуска Next.js/Node.js не требуется.

Единственная клиентская build-time переменная:

| Переменная | Назначение |
| --- | --- |
| `NEXT_PUBLIC_MARKETPLACE_URL` | Адрес внешнего Gml Marketplace API |

Основной backend всегда вызывается по относительным same-origin путям `/api/v1`. SignalR использует
относительные пути `/ws`.

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_MARKETPLACE_URL=https://gml-market.recloud.tech \
  -t gml-web-client .
docker run --rm -p 8081:8081 gml-web-client
```

Финальный образ основан на Nginx и содержит только каталог `out/`. Nginx слушает порт `8081`.

Конфигурация frontend-контейнера сохраняет slug вида `/dashboard/profile/<name>`: для такого URL
внутренне отдаётся статическая оболочка `/dashboard/profile/index.html`. Неизвестные URL вне этого
маршрута возвращают `404`.

## Внешний reverse proxy

Frontend-контейнер не проксирует backend. Внешний ingress или reverse proxy должен маршрутизировать
один публичный origin по следующему контракту:

- `/api/v1/*` — HTTP-запросы в Gml backend;
- `/ws/*` — Gml backend с поддержкой WebSocket upgrade;
- остальные пути — frontend-контейнер на порту `8081`.

Пример Nginx-конфигурации внешнего proxy:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;

    location /api/v1/ {
        proxy_pass http://gml-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws/ {
        proxy_pass http://gml-backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://gml-web-client:8081;
        proxy_set_header Host $host;
    }
}
```

Backend остаётся ответственным за авторизацию и защиту данных. Клиентский `AuthGuard` скрывает
dashboard до проверки access token или завершения refresh-запроса.

## Проверки

```bash
npm run build:static
npx playwright test
```

Playwright требует запущенный frontend и доступный тестовый backend.

## License

[Apache License 2.0](LICENSE)
