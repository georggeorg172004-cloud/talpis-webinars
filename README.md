# Talpis webinars

Static pages and Cloudflare Pages Functions for the webinar pages.

## Important

- Production uses Cloudflare Pages, R2, and D1.
- The admin export token is configured only as the Cloudflare Pages secret `LEADS_EXPORT_TOKEN`.
- Video files are stored in R2 and are intentionally not committed to this repository.

## Local preview

```bash
npx wrangler pages dev .
```

