# Legacy backend (not used by the GitHub-only portfolio)

This directory contains the previous optional Node.js server implementation. It is **not part of the current deployment**.

The portfolio now runs entirely on GitHub Pages and GitHub Actions:
- public pages are served by GitHub Pages;
- the CMS is handled by `.github/workflows/portfolio-cms.yml`;
- CMS updates are validated and proposed as Pull Requests;
- no VPS, Node.js host, GitHub App, OAuth client secret, or server environment file is required.

Do not deploy this backend or add secrets to the repository. The source is retained only as legacy reference material. See the repository root `README.md` and `BACKEND_SETUP.md` for the supported GitHub-only workflow.

GitHub Pages is static hosting, so automatic Telegram message delivery is intentionally not enabled. The public contact form prepares a Telegram draft for the visitor to send manually.
