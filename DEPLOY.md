# Publishing TVMG

The live site is the contents of **`Site/`** (index.html, terms.html, css/, js/, assets/).
Repo: `https://github.com/KitchCooks/tvmg-website` (private).
Target: a **new Afrihost account** with **tvmg.co.za as the primary domain** (doc root = `public_html`).

---

## Primary method — cPanel Git Version Control

This pulls the repo into the account and deploys `Site/` into `public_html` via `.cpanel.yml`.

1. **Create the Afrihost hosting** for tvmg.co.za (primary domain) and note the cPanel login.
2. **Let cPanel reach this private repo.** Cloning a private GitHub repo needs auth — pick one:
   - **Easiest:** make the repo public — `gh repo edit KitchCooks/tvmg-website --visibility public` (it's a marketing site; nothing secret is committed). Then cPanel can clone the HTTPS URL directly.
   - **Or keep it private:** in cPanel → **SSH Access**, generate/copy the account's public key, add it to GitHub repo **Settings → Deploy keys** (read-only), and clone with the SSH URL `git@github.com:KitchCooks/tvmg-website.git`.
3. In cPanel → **Git Version Control → Create**, paste the clone URL, repo path e.g. `repositories/tvmg-website`.
4. Open the repo entry → **Pull or Deploy → Deploy HEAD Commit**. `.cpanel.yml` copies `Site/` into `public_html`.
5. **Publish updates from here:** I commit + push to `main`; you click **Update from Remote** then **Deploy** in cPanel. (Optional: add a GitHub webhook to auto-pull — Afrihost supports it.)

`.cpanel.yml` already targets `$HOME/public_html/`, correct for a primary domain.

## DNS / domain
- Point **tvmg.co.za** to the new Afrihost account (nameservers or A record per Afrihost).
- **terms.tvmg.co.za** (unlisted Terms page): in cPanel → **Subdomains**, create `terms`, set its doc
  root to a folder holding the Terms page as `index.html` (copy `Site/terms.html` there), **or** add a
  rewrite so the subdomain serves `/terms.html`. It already has `noindex,nofollow`.

---

## Alternatives (also wired up)

**Manual over SSH:** `bash ~/repositories/tvmg-website/deploy.sh` (deploys to `$HOME/public_html`).

**GitHub Action (push → auto FTP):** `.github/workflows/deploy.yml` is in the project but not yet
committed (the `gh` token lacked `workflow` scope). To enable:
```bash
gh auth refresh -h github.com -s workflow
cd "/Users/home/Documents/TVMG" && git add .github && git commit -m "Add FTP deploy workflow" && git push
```
then add repo secrets `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD` (Settings → Secrets → Actions).

## Notes
- Static site, no build step. The sample videos in `Site/assets/videos/` are committed; the
  `video_build/` pipeline that makes them is local-only and not deployed.
- Enquiry CTAs go to WhatsApp (`wa.me/27677065321`); the form has a pluggable endpoint (see `Site/README.md`).
