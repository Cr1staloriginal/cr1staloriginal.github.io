# Discord avatar sync

The portfolio reads `avatar-sync.json` and uses its `avatar_url` for the profile image. GitHub Actions checks Discord once per hour and commits the JSON only when the avatar URL changes.

## One-time setup

1. Open the repository's **Settings → Secrets and variables → Actions**.
2. Select **New repository secret**.
3. Set the name to `DISCORD_BOT_TOKEN`.
4. Set the value to the token of a Discord bot application that can query the target user through the Discord API. Do not put the token in source code or send it in chat.
5. Open **Actions → Sync Discord avatar → Run workflow** to test it.

Target Discord user ID: `1097906739552206938`.

If the workflow reports an API permission or authentication error, check the bot token and whether the bot can access the target user's basic profile data. Until the secret is configured, the site safely falls back to `avatar.png`.
