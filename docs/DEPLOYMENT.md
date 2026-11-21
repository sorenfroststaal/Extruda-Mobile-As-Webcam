# Cloudflare deployment

For this existing Windows checkout, Wrangler's saved account login uses the
project-local configuration root. Set it before deploying from PowerShell:

```powershell
$env:XDG_CONFIG_HOME = Join-Path (Get-Location) '.wrangler/configroot'
$env:WRANGLER_SEND_METRICS = 'false'
node node_modules/wrangler/bin/wrangler.js deploy
```

Run from the repository root, after confirming the intended branch and changes.
The `.wrangler` directory is ignored by Git and can contain credentials. Never
commit or print its configuration files. A missing login without this environment
setting does not establish that the stored account login is missing or expired.
If authentication still fails with the correct configuration root, use the
official Wrangler login flow with that same environment setting.

Verify `/api/health`, the public download link and changed public assets after
deployment. Updating Cloudflare does not update installed Windows apps.
