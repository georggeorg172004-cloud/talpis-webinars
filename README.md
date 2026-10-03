# Talpis webinars

Страницы вебинаров, регистрация зрителей и Cloudflare Pages Functions.

## Активная версия

- Корень проекта (`index.html`) — главная страница.
- `efir-denis-ognevsky-sostoyanie/` — страница эфира «Состояние».
- `web-put-k-sebe/` — страница «Путь к себе».
- `admin.html` — выгрузка всех регистраций и регистраций эфира «Состояние».
- `functions/api/` — регистрация и CSV через D1.
- `functions/media/` — потоковая выдача видео из R2 с поддержкой Range-запросов.

## Cloudflare

Production использует Cloudflare Pages, D1 и R2. Идентификаторы базы и имя R2-бакета находятся в `wrangler.toml`; секрет `LEADS_EXPORT_TOKEN` задаётся только в настройках Cloudflare Pages и не хранится в GitHub.

Видео намеренно не коммитятся в репозиторий: они хранятся в R2.

## Старые страницы

Каталог `site/` и связанные с ним Supabase Functions сохранены из предыдущей версии проекта для истории и совместимости. Активный деплой настроен на корень проекта.

## Локальный preview

```bash
npx wrangler pages dev .
```

## Деплой

```bash
npx wrangler pages deploy . --project-name talpis-webinars
```
