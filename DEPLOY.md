# Publishing TVMG (same pipeline as the Agulhas Report site)

The live site is the contents of **`Site/`** (index.html, terms.html, css/, js/, assets/).
Three ways to publish, all driven from this repo — pick one (the GitHub Action is the
"edit in Claude Code → push → it goes live" path):

## A) GitHub Action → auto FTP deploy (recommended)
On every push to `main`, `.github/workflows/deploy.yml` builds `dist/` (just the public
files) and FTP-syncs it into the host. **One-time setup:**

1. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `FTP_HOST` — your Afrihost FTP host (e.g. `ftp.tvmg.co.za` or the server hostname)
   - `FTP_USERNAME` — the FTP/cPanel user (ideally an FTP account scoped to the site's folder)
   - `FTP_PASSWORD` — that account's password
2. Confirm `server-dir` in `deploy.yml` matches where the site should land:
   - FTP user rooted at `public_html` → `./` (current default)
   - FTP user logs in at `/home/<user>` → `./public_html/`
   - tvmg.co.za is an **addon** domain → its doc root, e.g. `./tvmg.co.za/`
3. Push to `main` (or run the workflow from the Actions tab). Done — future edits auto-deploy.

## B) cPanel "Git Version Control" (no GitHub secrets needed)
1. cPanel → **Git Version Control → Create**, clone `https://github.com/<owner>/tvmg-website.git`.
2. Edit `.cpanel.yml`: set `DEPLOYPATH` to this account's doc root (replace `CPANEL_USER`).
3. Hit **Pull or Deploy** in cPanel whenever you want to go live.

## C) Manual, over SSH
`bash ~/repositories/tvmg-website/deploy.sh` on the server (set `DEST=` for an addon domain).

---

## Domain / DNS
- Point **tvmg.co.za** at the Afrihost account (primary domain, or add it as an addon domain).
- **terms.tvmg.co.za** (the unlisted Terms page): create a subdomain in cPanel with its doc
  root set to a folder containing `terms.html` (rename it to `index.html` there), **or** add a
  redirect/rewrite so the subdomain serves `/terms.html`. The page already has
  `noindex,nofollow` so it stays out of search.

## Notes
- Static site, no server-side code or build step — nothing to compile.
- The enquiry form posts via WhatsApp links + a pluggable endpoint (see `Site/README.md`).
- Regenerating the sample videos is local-only (`video_build/`); it is not part of deploy.
