# The Boring Business School — Master Reference

*Powered by TVMG (Train Visual Media Group). Last updated: 8 August 2026.*

One file that explains the whole venture: what it is, what we sell, how the
funnel works, what exists already, what's still open, and the rules that keep
it compliant. Written to brief any person or AI session cold.

---

## 1. What it is

The Boring Business School (BBS) is a South African online business school.
Core belief, brand line, and hook: **"Boring businesses breed millionaires."**
Everyone chases sexy startups (apps, crypto, dropshipping); meanwhile boring
local service businesses (pest control, wheelie bin washing, gutter clearing,
grease traps, pressure washing, junk removal) quietly build real wealth with
no competition for attention, deposit-funded starts, and monthly contracts.

BBS teaches ordinary South Africans to start one with the money already in
their pocket. It is a separate brand from TVMG (own look, own domain, own
campus) but "powered by TVMG" appears everywhere.

**Origin story / proof:** Ndumulelo trained in person with the founder, built
a pest control business on this model, and it now supports him and his family
(verified facts only; no invented numbers). The founder figure for the wider
TVMG world is Kamo (10+ years in training, R100k-120k/week at his company's
peak, major clients incl. SAPS training).

## 2. Brand system

- **Look:** Kurzgesagt-style flat vector, business edition. Ink/charcoal
  backgrounds (#12171D → #0A0D11), money-gold accent (#F5C542, gradient to
  #FFD866), success-green (#2FBF71), cream text (#F4EFE6), muted #9AA3AD.
  Cards #1E242B. Fonts: Poppins (heads) + Inter (body).
- **Mascot energy:** the cockroach gag (a flat-vector roach that gets sprayed)
  and Ndumulelo as a recurring animated character (dark-skinned, olive
  overalls, green cap).
- **Wordmark:** text-only "BORING **BUSINESS** SCHOOL" (BUSINESS in gold).
- **Tone:** Kurzgesagt visuals + Alex Hormozi delivery. Blunt, warm,
  respectful, zero fluff, real Rand numbers, SA references (CIPC, SARS, load
  shedding, taxis, WhatsApp). Never talk down. No em dashes in copy.

## 3. The product line

**Flagship: The Boring Business Masterclass** — ±5 hours, 8 modules,
34 animated lessons (6-9 min each), quiz after every lesson, templates
included (quote template, job cards, income/expense sheet, walk-in script
cards), certificate of completion. **R649 once-off.**

Module map:
1. The Boring Billionaire Thesis (why boring beats sexy)
2. Choosing Your Boring Business (the five filters)
3. The Deposit Model (start with no capital)
4. Pricing & Quoting Like a Professional
5. Your First 10 Customers
6. The McDonald's System (checklists, job cards, photo proof)
7. Money & Admin Without Tears (bookkeeping, CIPC, SARS basics)
8. Hiring, Scaling & What's Next

**Planned upsell:** The Blueprint Club — R249/month, one deep-dive trade
blueprint per month (sold at the end of Module 8). Subscription tier =
flagship price upfront + monthly premium for access to all courses as they
release; bounced payment ⇒ access revoked. (Payment rails for recurring
billing still undecided — see §7.)

**Buyer outcomes (weave into everything):** start & own a business /
earn independently as a solo tradesman / become more employable.

**Avatar:** South African, 22-45, employed or hustling (security, mining,
retail, drivers, admin), R500-R5,000 available, watches on a phone with
limited data. Smart; never been shown the mechanics of business.

## 4. Compliance rules (non-negotiable)

- The masterclass is **aligned to the exit-level outcomes of the New Venture
  Creation qualifications (SAQA ID 49648, NQF Level 2 and SAQA ID 66249,
  NQF Level 4)** transitioning under the QCTO framework.
- It is **NOT accredited** and grants **no credits**. Never describe what the
  buyer receives with the words "accredited," "qualification," "credits," or
  "NQF certificate." Certificates and module outros must carry the alignment
  + not-accredited disclosure.
- No income promises to the buyer, ever. Money/lifestyle claims may only
  describe Ndumulelo's real story or the industry in general.
- Regulated trades (electrical COCs, gas, plumbing): always teach the legal
  route (subcontract registered pros or get registered).
- Standard footer: *"Boring Business School is a non-accredited professional
  development programme aligned to New Venture Creation qualification
  outcomes (SAQA 49648/66249). Results depend on your effort. Trades shown
  may require registration or licensing in South Africa. Always verify legal
  requirements before performing regulated work."*
- **7-day no-questions-asked full refund** — promised publicly on the landing
  page with a working request form. Honour it fast.

## 5. The funnel

```
Meta ad (Ndumulelo story, Sekou VO)
   └→ boring.tvmg.co.za  (landing page: hook, proof, modules, R649, refund)
        ├→ Pay online (Yoco checkout — link pending)   → auto-access
        └→ EFT + WhatsApp proof of payment             → email whitelisted
             └→ academy.tvmg.co.za (the campus: lessons, quizzes, certificate)
```

- tvmg.co.za homepage is a two-path hub that also funnels into BBS.
- Testimonials from real users get added to the landing page as they arrive.
- Ads run warm-first, then cold; message-match rule: ad hook = landing hero
  ("millionaires", not "billionaires" — the story must cash the hook's cheque).

## 6. What exists today (assets + locations)

| Asset | Location | Status |
|---|---|---|
| Launch ad, 3 formats (Sekou VO, 95s) | `Marketing/ADS/BORING BUSINESS/BBS_Ad_Ndumulelo_{16x9,9x16,1x1}.mp4` | ✅ delivered, verified |
| Ad engine (reusable for future BBS ads) | `video_build/diverse/ad_boring.html` + `render_boring_shard.js` + `out_boring/` | ✅ |
| Landing page (self-contained single file) | repo `Site/boring/index.html` → deploys to `public_html/boring/` | ✅ built & pushed; placeholders open (§7) |
| TVMG hub homepage funnelling to BBS | repo `Site/index.html` | ✅ pushed |
| Ad copy package (hooks, scripts, captions, cutdown) | in session history; hook A locked | ✅ |
| Campus (Moodle #2, multi-course, certificates) | VPS `/opt/boring-academy`, private on `127.0.0.1:8081` | 🟡 installed, being configured (other session) |
| Course master prompt (8 modules, output format) | this file + original brief | ✅ |
| Course content (34 lessons, 251 beats, 102 quiz questions) | `academy.tvmg.co.za`, built and audited | ✅ live |

## 7. Open decisions & placeholders

1. **Hosting for boring.tvmg.co.za: DECIDED — normal Afrihost domain, not the
   VPS.** Go-live steps: cPanel → Domains → create subdomain `boring` with
   document root `public_html/boring` (the deploy pipeline already fills it);
   if it doesn't resolve, add DNS A record `boring` → same IP as tvmg.co.za
   (NOT the VPS IP); AutoSSL will issue the certificate once it resolves.
   `academy.tvmg.co.za` still points at the VPS (173.208.167.222).
2. **Campus narrator voice:** test clips sent (Musole / Nassdaq / Kenzo).
   Awaiting pick. Ads use **Sekou** (ElevenLabs `ddNwxTGW1Qc7ZuSevaHF`).
3. **Yoco checkout link** for the landing page's "Pay online" button
   (placeholder `YOCO_CHECKOUT_LINK_PLACEHOLDER`; until wired, the button
   routes to the EFT instructions).
4. **Subscriptions:** Yoco has no recurring billing. Options: A) Yoco +
   Paystack for the monthly tier (auto-revoke on failed payment, recommended)
   or B) Yoco-only with monthly payment links + scheduled revoke. Undecided.
5. **EFT details on the landing page:** `[BANK DETAILS]` and
   `[WHATSAPP NUMBER]` placeholders.
6. **Testimonials:** three placeholder cards on the landing page waiting for
   real user quotes (name + business/area + quote).
7. **Pricing confirmation for the subscription tier** (flagship upfront +
   R?/month; R249 Blueprint Club assumed same tier?).
8. **Narration:** done. 251 Sekou clips across 34 lessons, on the campus.

## 8. Production pipeline (how BBS content gets made)

- **Ads & lesson visuals:** deterministic Kurzgesagt engine — HTML/SVG scenes
  with `window.render(t)`, rendered frame-by-frame via Playwright, encoded
  with ffmpeg, VO via ElevenLabs (curl), music bed ducked under narration.
  All in `video_build/diverse/`.
- **Course lessons:** produced module-by-module from the master prompt
  (8 modules, lesson output format: title, hook, 900-1,300 word script,
  scene directions, do-this-today action, 3 quiz questions, templates).
  Every lesson visually unique — no repeated scene patterns.
- **Campus:** Moodle (Docker) with sequential unlock, no skip-forward,
  tab-switch pause + logging, 80% quiz gates, full audit trail, branded
  completion certificate carrying the NVC alignment wording, Yoco auto-access
  on payment, EFT whitelist flow, revoke-on-bounce for subscriptions.

## 9. Relationship to the rest of TVMG

- **TVMG (tvmg.co.za):** parent brand. Homepage = hub funnelling to BBS and
  to the Digitization Service (`/digitization.html`, the Digital Campus for
  QCTO-accredited providers, from R65,000).
- **QCTO funnel (separate):** webinar → R15k Accreditation Mentorship
  (Kamo). Assets: webinar deck, Kamo ad, mentorship ad, `/webinar.html`
  bridge page.
- **Shared infra:** Brevo for email (hello@tvmg.co.za), FormSubmit →
  trainvisualmedia@gmail.com for site forms (incl. BBS refund requests),
  cPanel git deploy for the website, VPS for Moodle campuses + mailer.
