# TVMG — Train Visual Media Group · Website

A slick, conversion-focused marketing site for TVMG, a South African studio producing
custom training, induction and explainer videos for businesses.

Static site — **no build step, no backend.** Plain HTML, CSS and a single small JS file.
Built mobile-first, fully responsive, accessible, and ready to deploy to Vercel/Netlify
(or any static host).

---

## Structure

```
Site/
├── index.html          Main single-page marketing site (tvmg.co.za)
├── terms.html          Terms & Conditions — UNLISTED, for terms.tvmg.co.za (noindex)
├── css/
│   ├── tokens.css      ← DESIGN TOKENS (all brand colours, fonts, spacing, motion)
│   └── styles.css      All component / layout styles
├── js/
│   └── main.js         Nav, scroll-reveal, and the enquiry form (← FORM ENDPOINT here)
└── assets/
    ├── logo/           Logo variants (from the brand pack)
    ├── favicon/        Favicons + app icons (from the brand pack)
    └── og_image.png    Social share image
```

All brand assets are copied from `../Brand/tvmg_brand_assets/`.

---

## Run locally

No tooling required — it's static. Any static server works:

```bash
cd Site
python3 -m http.server 4321
# open http://localhost:4321
```

(or `npx serve`, VS Code Live Server, etc.)

---

## Brand tokens — where the look lives

**Everything visual is centralised in [`css/tokens.css`](css/tokens.css)** as CSS variables,
extracted verbatim from the brand pack (`Brand/TVMG_brand_guide.pdf` + the assets README):

| Token            | Value     | Brand name   |
|------------------|-----------|--------------|
| `--tvmg-navy`    | `#061B3F` | TVMG Navy    |
| `--media-blue`   | `#0B63CE` | Media Blue   |
| `--signal-blue`  | `#1683FF` | Signal Blue  |
| `--ice-white`    | `#F7FAFF` | Ice White    |
| `--ink`          | `#0E1726` | Ink          |
| `--silver`       | `#CBD5E1` | Silver       |

Type: **Montserrat ExtraBold** for headlines, **Inter** for body/UI (the brand's stated
type direction), loaded from Google Fonts in each page's `<head>`.

Change a colour or font in one place (`tokens.css`) and it updates site-wide. Do not
hard-code brand colours elsewhere.

---

## Plug in the enquiry form endpoint

The form submits via a **pluggable method** with a safe fallback. Open
[`js/main.js`](js/main.js) (top of the file):

```js
var FORM_ENDPOINT = null;                 // ← paste your Formspree/Getform/Basin URL
var ENQUIRY_EMAIL = "hello@tvmg.co.za";   // ← used by the mailto fallback
```

- **Set `FORM_ENDPOINT`** to your form-handler POST URL (e.g. `https://formspree.io/f/xxxx`).
  The form POSTs JSON and shows the success state on a 2xx response.
- **Leave it `null`** and the form falls back to opening the user's mail client with a
  pre-filled enquiry to `ENQUIRY_EMAIL`. (It also falls back to mailto if the endpoint
  request fails, so a lead is never silently lost.)

The submission payload includes `terms_accepted` and a `terms_accepted_at` timestamp,
recording T&C acceptance at enquiry time (the required T&C checkbox links to
`terms.tvmg.co.za`).

> Also update the contact details marked `<!-- TODO -->` in `index.html`:
> the footer email and the WhatsApp link (`https://wa.me/27000000000`).

---

## Deploy

### Main site → `tvmg.co.za`
Deploy the `Site/` directory as a static site (Vercel, Netlify, Cloudflare Pages, S3, etc.).
No build command; the output/publish directory is `Site` (or the repo root if you deploy
this folder directly).

### Terms page → `terms.tvmg.co.za` (unlisted subdomain)
`terms.html` is intentionally **not linked from the main nav or any sitemap** and carries
`<meta name="robots" content="noindex, nofollow">`. It's only reached from the enquiry
form checkbox and the footer (both pointing at `https://terms.tvmg.co.za`).

Two simple ways to serve it on the subdomain:

**Option A — same deployment, rewrite the subdomain root to `/terms.html`.**
Point the `terms` DNS record at the same host, then add a rewrite. Examples:

- *Netlify* (`netlify.toml`):
  ```toml
  [[redirects]]
    from = "https://terms.tvmg.co.za/*"
    to = "/terms.html"
    status = 200
    force = true
  ```
- *Vercel* (`vercel.json`): use a `has` host match on `terms.tvmg.co.za` rewriting `/` → `/terms.html`.

**Option B — separate tiny deployment.** Publish just `terms.html`, `css/`, and `assets/`
(logo + favicon) as a standalone static site bound to `terms.tvmg.co.za`, with `terms.html`
as the index.

Either way, set the `terms` subdomain's DNS (CNAME/ALIAS) per your host's instructions.

---

## Sample training videos ("Our work" / `#work` section)

Three sample snippets are rendered to `Site/assets/videos/`:

| File | Topic | Theme |
|------|-------|-------|
| `tvmg_sample_popia.mp4`  | Protecting Personal Information (POPIA) | dark / signal-blue |
| `tvmg_sample_safety.mp4` | Workplace Safety Induction | dark / diagonal media-blue |
| `tvmg_sample_fire.mp4`   | Fire Safety & Evacuation | light / ice-white |

Each has a matching `.jpg` poster (the cover slide). They are real 1080p MP4s
(H.264 + AAC), ~48–54s each, with studio narration, animated brand slides
(Ken Burns motion), and per-video distinct visual systems.

### How they're built (the `video_build/` pipeline — NOT deployed)
Everything lives in `../video_build/` (kept out of the published `Site/`):

- `scripts.py` — the on-screen text + narration scripts, the topic/theme map, and
  the **voice mapping**.
- `render_slides.py` — composes the slides with Pillow into `out/<id>/slide_*.png`.
- `build_video.py` — generates narration via the ElevenLabs API, then assembles
  each video with ffmpeg. **Idempotent**: existing `out/<id>/audio_*.mp3` are reused,
  so re-runs don't re-spend ElevenLabs characters. Delete a clip's mp3s to regenerate.

Regenerate:
```bash
cd video_build
python3 render_slides.py                       # rebuild slides (after editing scripts.py)
export ELEVEN_API_KEY=sk_...                    # your key
python3 build_video.py                          # narration + MP4s -> Site/assets/videos/
```

### Voices: South African (active)
The shipped samples are narrated by three South African voices, set in `scripts.py`
as `VOICES_SA`: **Ramona** (POPIA), **Cameron** (Safety), **Mapendo** (Fire). These
are ElevenLabs "library" voices, which require a **paid** plan to use via the API
(the account is on Starter). Generation is gated by the `USE_SA_VOICES` env var:
```bash
cd video_build
rm -f out/*/audio_*.mp3                          # clear cached audio to re-voice
export ELEVEN_API_KEY=sk_...
USE_SA_VOICES=1 python3 build_video.py           # regenerate in SA voices
```
`VOICES_FREE` (built-in premade voices) remains as a free-tier fallback if ever needed.

> Length: snippets run ~55–60s. Starter's character cap is generous; to make the full
> 3–5 minute videos from the brief, lengthen the `narration` fields in `scripts.py` and
> re-run. Each run's character spend is printed (these three together use ~2,232 chars).

---

## Notes / guardrails honoured

- **No AI mention anywhere on the public site.** Production is described as "custom narrated",
  "professionally produced", "studio-quality narration". AI is disclosed only in the T&Cs
  (Section 3, using the exact required wording).
- **No fabricated testimonials, stats, or savings figures.** Positioning stays factual
  ("days, not weeks", "a fraction of traditional production cost").
- The 7-day satisfaction guarantee trust line appears in the hero, at pricing, and at the form.
- Accessibility: semantic landmarks, skip link, labelled form fields with inline errors,
  keyboard-operable nav, visible focus rings, `prefers-reduced-motion` respected.
- SEO: titles, meta description, Open Graph / Twitter cards, JSON-LD, favicons from the brand pack.

### Editing content quickly
- **Headline alternatives** are in an HTML comment above the hero `<h1>` in `index.html`.
- **Pricing** tiers are plain markup in the `#pricing` section — edit the numbers/turnaround inline.
- **Legal copy** is plain prose in `terms.html` (flagged `<!-- TODO: legal review -->`).
