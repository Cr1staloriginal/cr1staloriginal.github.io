# Portfolio API

Node.js 20+ service for the portfolio CMS and contact form. It is intentionally separate from GitHub Pages.

## Security model

- GitHub OAuth login; only `ADMIN_GITHUB_LOGIN` is accepted.
- Session is encrypted with AES-256-GCM and stored in an HttpOnly cookie.
- OAuth state is checked on callback.
- CMS can edit only `data/site-data.json`, `data/changelog.json`, and `data/achievements.json`.
- Each CMS save creates a new branch and pull request; it never writes directly to `main`.
- Contact form is validated and rate-limited before server-side Telegram delivery.
- No secrets belong in frontend files or Git.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and fill the values.
3. Create a GitHub App with a user authorization callback URL matching `GITHUB_CALLBACK_URL`. Set repository permissions to **Contents: Read and write** and **Pull requests: Read and write**. Install the app on this repository only. The OAuth user authorization is used to verify the owner; the server then creates a short-lived installation token restricted to this repository.
4. Set `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` from the GitHub App settings. `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are the app's user authorization credentials. The backend checks that the configured owner has installed the app on the configured repository, then requests a short-lived token for that repository only.
5. Install and start:

```bash
npm install
npm run check
npm start
```

The service listens on `127.0.0.1:8787` by default; the Docker image sets `HOST=0.0.0.0`. Put Nginx or Caddy in front of it with HTTPS.

## Required environment

See `.env.example`. Generate `SESSION_SECRET` with a cryptographically secure random value of at least 32 bytes. Store the App private key and OAuth client secret only in the host's secret manager or protected environment file. `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are required only for contact delivery.

## Important deployment note

The current public site uses the GitHub Pages origin. Cross-site cookies may be blocked by browser privacy settings. For a reliable admin session, use a custom domain for the portfolio and expose this API through the same site origin (for example, reverse proxy `/api/*` to this service). If the API is hosted on a separate origin, set the API URL in the `portfolio-api` meta tag in both `index.html` and `admin/index.html`, configure the exact `APP_ORIGIN`, and test cookie behavior in target browsers.

The in-memory rate limiter is suitable only for a single service instance. For multiple instances, replace it with a shared store or provider-level rate limiting. Put the service behind HTTPS and a reverse proxy; do not expose port 8787 directly.

## API

- `GET /api/health`
- `GET /api/auth/github`
- `GET /api/auth/callback`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/admin/content?file=data/site-data.json`
- `POST /api/admin/content` with `{ "file": "...", "content": "valid JSON text" }`
- `POST /api/contact` with `{ "name", "contact", "topic", "message", "website" }`

CMS saves return a pull-request URL. Review and merge each PR as usual.
