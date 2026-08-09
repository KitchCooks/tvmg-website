# Paste this into the OTHER Claude Code session (the one with VPS access)

The Boring Business School landing page has been rebuilt. Everything is on
GitHub in a public repo, so you can pull it straight down on the VPS. Nothing
secret is in the repo, and nothing secret needs to go into it.

## What to do

Deploy the new landing page to whatever serves **boring.tvmg.co.za** on this
VPS, replacing the current `index.html`, and add the new files alongside it.

```bash
# 1. Find the current docroot for boring.tvmg.co.za (Caddy/nginx config or the
#    folder holding the existing index.html), then from inside that folder:

BASE="https://raw.githubusercontent.com/KitchCooks/tvmg-website/main/Site/boring"

# 2. The page itself. Do NOT fetch success.html, it was removed on purpose:
#    your Yoco successUrl points at welcome.html, which delivers logins.
curl -fsSL "$BASE/index.html" -o index.html

# 3. The twelve learner-profile portraits the new carousel needs
mkdir -p img/testimonials
for n in 01 02 03 04 05 06 07 08 09 10 11 12; do
  curl -fsSL "$BASE/img/testimonials/t${n}.jpg" -o "img/testimonials/t${n}.jpg"
done

# 4. The Sekou-narrated explainer video (5 MB) and its poster frame.
#    The TVMG homepage embeds this by absolute URL from this VPS, so it must
#    be here or the homepage player will be broken.
mkdir -p video
curl -fsSL "$BASE/video/bbs-explainer.mp4"        -o video/bbs-explainer.mp4
curl -fsSL "$BASE/video/bbs-explainer-poster.jpg" -o video/bbs-explainer-poster.jpg

# 5. Favicon set (the tab currently shows a generic globe because no icon is set)
mkdir -p icon
curl -fsSL "$BASE/favicon.ico"      -o favicon.ico
curl -fsSL "$BASE/site.webmanifest" -o site.webmanifest
for f in icon-16 icon-32 icon-48 icon-192 icon-512 apple-touch-icon; do
  curl -fsSL "$BASE/icon/${f}.png" -o "icon/${f}.png"
done

# 6. Reload the web server if it caches (Caddy usually does not need this)
```

## Do NOT change the backend

The page still calls your existing endpoints and they must keep working:

- `POST /api/checkout`        -> returns `{"redirectUrl": "..."}` from Yoco
- `POST /api/refund-request`  -> returns `{"ok": true, "message": "..."}`

The page tries `/api/checkout` first, then falls back to `api/checkout.php`,
then falls back to showing EFT details. So if your endpoint is alive, card
payments work immediately with no edit.

The Yoco secret key stays where it already is on this VPS, in server env/config.
Never put it in the repo. The repo is public.

## What changed in the page

- Kept your design, copy and structure. It is your page, edited.
- Removed: the not-accredited sentence on the certificate, the "Is this an
  accredited qualification?" FAQ entry, the non-accredited wording in the
  footer, "Sekou, your no-nonsense SA narrator", and the "Zero fluff" heading.
- Removed every em dash and en dash.
- Fixed the FAQ: cards were white with cream text inside the dark section, so
  the questions were unreadable. Cards are dark now.
- Added a refund note under the hero CTA.
- Added a compact carousel of twelve illustrative learner profiles, styled to
  your paper/green palette. These are explicitly labelled as illustrative
  examples, not testimonials, with a disclosure line beneath the carousel.
- Added a Sekou-narrated explainer video under the hero.
- Added a favicon set (gold wheelie bin on charcoal). The icon links are
  root-relative, which is correct for boring.tvmg.co.za serving at its root.
- Fixed the certificate mock: its heading and name were cream on a light
  background and unreadable.
- Restored the accreditation FAQ entry, reworded to lead with what the buyer
  gets and land the negative at the end.
- Lesson count corrected from 37 to 34.

## Verify after deploying

1. `https://boring.tvmg.co.za` loads, FAQ text is readable, the certificate
   heading and name are readable, the carousel scrolls with twelve photos, and
   the explainer video plays with sound.
   Also check `https://boring.tvmg.co.za/video/bbs-explainer.mp4` returns 200,
   because the TVMG homepage embeds it from here.
2. Click "Pay with card", enter a name and email, and confirm it redirects to
   `c.yoco.com`. That proves `/api/checkout` is still wired.
3. Confirm the refund form still posts to `/api/refund-request`.
