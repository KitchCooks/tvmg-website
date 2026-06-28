# TVMG Client Intake Form — Full Field Specification

**Purpose:** Completed by the client *after* they have paid and accepted terms. Captures everything needed to produce their custom training video in one pass — all text answers and all uploaded files — and feeds the production pipeline (organised file storage + a prompt-ready `brief.md`).

**Placement:** Unlisted page at `/intake` (intake.tvmg.co.za). NOT linked in nav or footer. `noindex, nofollow`.

**Backend:** Supabase (Storage + Database + Edge Function). Files sorted into per-client, per-section subfolders. `brief.md` auto-generated on submit.

---

## Section 1 — Client & Project Basics

| Field | Type | Required | Helper text |
|---|---|---|---|
| Business / organisation name | Text | Yes | — |
| Contact person — full name | Text | Yes | For delivery and revision queries. |
| Email | Email | Yes | — |
| Phone | Tel | Yes | — |
| Quote / invoice reference | Text | Yes | From your quote or invoice — so we can match it to your order. |
| Which package did you purchase? | Dropdown | Yes | 0–10 min · 10–20 min · 20–30 min · 30–60 min · Training set (custom) · Not sure |

---

## Section 2 — The Video (Scope Confirmation)

| Field | Type | Required | Helper text |
|---|---|---|---|
| Video topic / title | Text | Yes | In one line, what is this video about? |
| Video length tier | Dropdown | Yes | 0–10 / 10–20 / 20–30 / 30–60 min — confirms scope |
| Purpose | Dropdown | Yes | Induction / onboarding · Health & safety · Compliance · Product or process training · Other |
| ↳ If "Other": specify | Text (conditional) | If Other | — |
| Who is the audience? | Text | Yes | e.g. new hires, all staff, a specific department, customers. Helps us set the tone. |
| What should someone know or be able to do after watching? | Long text | Yes | The learning outcome — keeps us aligned on what "done" looks like. |

---

## Section 3 — The Content (Most Important Section)

> **Section helper (display prominently):** "The quality of your video depends on the content you provide here. The more complete and clear your content, the better and faster your video. We build from what you supply."

| Field | Type | Required | Helper text | Storage subfolder |
|---|---|---|---|---|
| Upload your source content | File upload (multiple) | **Yes** | Documents, slides, policies, manuals, scripts, bullet points — whatever covers the content. Please provide all content you want covered. | `/01-source-content/` |
| Or paste your content / key points | Long text | Optional | For clients without documents — paste your content here. | — |
| Section-by-section breakdown | Long text | **Yes** | List the main sections this video should cover, in order. e.g. "1. Welcome 2. Company values 3. Safety basics…" This becomes the structure. | — |
| Anything that must be included word-for-word? | Long text | Optional | Legal disclaimers, compliance wording, exact policy language. (Critical for compliance videos.) | — |
| Anything to avoid or leave out? | Long text | Optional | — | — |

---

## Section 4 — Voice & Language

| Field | Type | Required | Helper text |
|---|---|---|---|
| Language(s) | Multi-select | Yes | English · Afrikaans · Other |
| ↳ If "Other": specify | Text (conditional) | If Other | **Note:** for languages other than English/Afrikaans, *you* are responsible for having a fluent speaker review the final version before sign-off. |
| Voice preference | Dropdown | Yes | Male · Female · No preference |
| Accent preference | Dropdown | Yes | South African · Neutral · Other |
| ↳ If "Other" accent: specify | Text (conditional) | If Other | Tailored to your liking, in an accent of your choice. |
| Tone | Dropdown | Yes | Formal / corporate · Friendly / approachable · Authoritative |

---

## Section 5 — Branding & Design

| Field | Type | Required | Helper text | Storage subfolder |
|---|---|---|---|---|
| Do you want it branded to your business? | Radio | Yes | Yes (bespoke design — upcharge applies) · No (use TVMG house style) | — |
| ↳ Upload logo, brand colours, fonts, guidelines | File upload (multiple) | If "Yes" | Logo, brand guidelines, font files. | `/02-branding/` |
| ↳ Brand colours (hex if known) | Text | Optional | e.g. #0B2545 | — |
| ↳ Visual preferences / examples you like | Long text | Optional | — | — |
| Images / photos / screenshots to include | File upload (multiple) | Optional | e.g. your premises, equipment, staff, product shots. | `/03-images-media/` |

---

## Section 6 — Portal (Conditional on Purchase)

| Field | Type | Required | Helper text |
|---|---|---|---|
| Did you purchase the interactive training portal? | Radio | Yes | Yes · No |
| ↳ How many staff need access? | Number | If "Yes" | — |
| ↳ Any setup notes? | Long text | If "Yes" | How you'd like it set up. |

---

## Section 7 — Logistics & Sign-off

| Field | Type | Required | Helper text |
|---|---|---|---|
| Deadline / when do you need this by? | Date | Yes | Urgent timelines may carry a priority surcharge — we'll confirm if so. |
| Who is the single approver? | Text | Yes | **One person** who signs off and requests revisions. This keeps your project on track and avoids conflicting feedback. |
| Confirmation checkbox | Checkbox | Yes | "I confirm I have provided all the content needed for this video, and I understand the video will be produced based on the information supplied above." |
| Terms acceptance checkbox | Checkbox | Yes | "I accept the Terms & Conditions" → links to terms.tvmg.co.za |

---

## Design Principles (build rules)

1. **Make Section 3's required fields actually required.** Incomplete content is the #1 cause of delivery delays. If they can submit without usable content, they will — and you'll be chasing. Force it.
2. **Helper text sets expectations and shifts responsibility.** "We build from what you provide" subtly makes content quality the client's responsibility — protects you and improves what you receive.
3. **Keep the "one approver" question prominent.** Naming a single sign-off person upfront is the best defence against revision chaos (multiple people sending conflicting notes). Small question, big protective payoff.
4. **The confirmation checkbox is your scope shield.** "I've provided everything needed" means if they later claim the video missed something, it was because *they* didn't supply it. Pairs with the 3-revisions policy.
5. **Conditional logic must work cleanly:** Other-purpose, Other-language, Other-accent, branding-if-yes, portal-if-yes.

---

## Form Flow (top to bottom)

**Basics → Video scope → Content (the big one) → Voice/Language → Branding → Portal → Logistics + Sign-off + Confirmation.**

This captures everything to fire the production prompt in one pass, forces content quality onto the client, names a single approver, and shields you on scope.

---

## Output on Submit

1. Files uploaded to Supabase Storage, sorted into the per-client, per-section subfolders above.
2. Submission record written to the database (all text answers).
3. `brief.md` auto-generated into the client's folder root — a prompt-friendly markdown brief structured for the Claude Code production pipeline (project, video, content, voice/language, branding, portal, logistics, file list + folder link).
4. Client sees success state: *"Thanks — we've received everything. We'll be in touch and start production. You'll hear from us within one business day."*
