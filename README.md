# Talpis Webinars

Единый проект страницы вебинара с регистрацией, админкой и экспортом данных.

## Что внутри

- `site/index.html` — публичная страница просмотра видео с формой регистрации.
- `site/_headers` — security headers для Cloudflare Pages.
- `functions/api/register.js` — backend endpoint регистрации зрителя.
- `functions/api/login.js` — вход в админку.
- `functions/api/viewers.js` — список зрителей для админки.
- `functions/api/export.csv.js` — выгрузка зрителей в CSV.
- `functions/admin/[[path]].js` — страница админки.

## Публичные адреса

- Страница вебинара: `/`
- Видео 1: `/video-1/`
- Видео 2: `/video-2/`
- Видео 3: `/video-3/`
- Видео 4: `/video-4/`
- Видео 5: `/video-5/`
- Админка: `/admin`

## Переменные Cloudflare Pages

Значения хранятся только в Cloudflare Pages Settings / Environment variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_KEY`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

Секреты не должны попадать в GitHub.

## Деплой

```bash
npx wrangler pages deploy site --project-name talpis-webinars
```

Cloudflare Pages автоматически забирает `functions/` из корня проекта при деплое.

## Безопасность

- Публичная страница не содержит Supabase service key.
- Регистрация идет через `/api/register` и использует publishable key на backend-стороне.
- Админские endpoints закрыты HttpOnly cookie-сессией.
- CSV экспорт доступен только после входа в админку.
- Supabase service key используется только на backend-стороне Cloudflare Pages Functions.
