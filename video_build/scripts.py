# -*- coding: utf-8 -*-
"""
Content + voice mapping for the three TVMG sample training snippets.
On-screen text is concise; `narration` is the spoken line (ElevenLabs).
Three distinct visual themes so the videos do NOT look like one repeated template:
  t1  dark / signal-blue / shield+dot-grid   (POPIA)
  t2  dark / media-blue  / diagonal bands    (Health & Safety)
  t3  light / ice-white  / concentric rings  (Fire safety)
"""

import os

# PREFERRED: three South African accent voices (added to the account library).
# These require a PAID ElevenLabs plan to use via the API. The free tier returns
# "Free users cannot use library voices via the API". Once the plan is upgraded,
# run with USE_SA_VOICES=1 to regenerate the narration in these SA voices.
VOICES_SA = {
    "ramona":  "NPuwPNKx2XCQDddfkHN4",  # female, professional, South African
    "cameron": "NOpwXiXLWfbN5KhzBTFW",  # male, deep & smooth, South African
    "mapendo": "dOqxOZEisn8SiUH1dPCC",  # female, warm & confident, South African
}

# FREE-TIER FALLBACK: distinct built-in (premade) voices usable on the free API.
# Not South African, but keeps three clearly different narrators so the samples
# are real and the section works today. Same slot names map 1:1 to VOICES_SA.
VOICES_FREE = {
    "ramona":  "EXAVITQu4vr4xnSDxMaL",  # Sarah  - mature, reassuring (female)
    "cameron": "cjVigY5qzO86Huf0OWal",  # Eric   - smooth, trustworthy (male)
    "mapendo": "Xb7hH8MSUJpSbSDYk0k2",  # Alice  - clear, engaging educator (female)
}

VOICES = VOICES_SA if os.environ.get("USE_SA_VOICES") == "1" else VOICES_FREE

SCRIPTS = [
    {
        "id": "popia",
        "theme": "t1",
        "voice": "ramona",
        "accent_name": "South African English",
        "topic_label": "Compliance training",
        "menu_title": "Protecting Personal Information",
        "menu_sub": "A POPIA basics module",
        "slides": [
            {"layout": "cover", "eyebrow": "Compliance training",
             "title": "Protecting Personal Information",
             "sub": "Your POPIA basics",
             "narration": "Welcome to your introduction to protecting personal information under the Protection of Personal Information Act, known as POPIA."},
            {"layout": "statement", "eyebrow": "Why it matters",
             "title": "Trust is built on how we handle data",
             "sub": "POPIA sets the rules for personal information in South Africa.",
             "narration": "POPIA sets the rules for how every business in South Africa may collect, use and store people's personal information."},
            {"layout": "bullets", "eyebrow": "Know the basics",
             "title": "What counts as personal information?",
             "items": ["Names and ID numbers", "Contact details", "Financial records", "Health information"],
             "narration": "Personal information includes names and identity numbers, contact details, financial records, and health information."},
            {"layout": "steps", "eyebrow": "Three habits",
             "title": "How we stay compliant",
             "items": ["Collect only what you need", "Keep it secure", "Use it only for its purpose"],
             "narration": "Three simple habits keep us compliant. Collect only what you need, keep it secure, and use it only for the purpose it was given for."},
            {"layout": "statement", "eyebrow": "If something goes wrong",
             "title": "Spotted a data breach?",
             "sub": "Report it to your information officer immediately.",
             "narration": "If you ever suspect that personal information has been lost or exposed, report it to your information officer immediately."},
            {"layout": "recap", "eyebrow": "Remember",
             "title": "Three words to live by",
             "items": ["Minimise", "Secure", "Respect"],
             "narration": "So remember three words. Minimise what you collect, secure what you hold, and respect why it was shared with you."},
            {"layout": "close", "eyebrow": "A TVMG sample",
             "title": "Compliance, made watchable.",
             "sub": "This is the kind of training we produce for your team.",
             "narration": "This is the kind of clear, compliant training that T V M G produces for your team."},
        ],
    },
    {
        "id": "safety",
        "theme": "t2",
        "voice": "cameron",
        "accent_name": "South African English",
        "topic_label": "Health & safety",
        "menu_title": "Workplace Safety Induction",
        "menu_sub": "Before you start on site",
        "slides": [
            {"layout": "cover", "eyebrow": "Health & safety",
             "title": "Workplace Safety Induction",
             "sub": "Before you start on site",
             "narration": "Welcome on board. Before you start, here is your essential workplace health and safety induction."},
            {"layout": "statement", "eyebrow": "The mindset",
             "title": "Safety is everyone's job",
             "sub": "A safe site protects you, your colleagues and your livelihood.",
             "narration": "Safety is everyone's responsibility. A safe site protects you, your colleagues, and the work that supports your livelihood."},
            {"layout": "bullets", "eyebrow": "Non-negotiable",
             "title": "Wear your PPE, every time",
             "items": ["Hard hat", "Safety boots", "High-visibility clothing", "Eye and ear protection"],
             "narration": "Always wear your protective equipment. That means your hard hat, safety boots, high visibility clothing, and your eye and ear protection."},
            {"layout": "statement", "eyebrow": "Stay aware",
             "title": "Know your hazards",
             "sub": "Slips, moving machinery and manual handling cause most incidents.",
             "narration": "Know the common hazards. Slips and trips, moving machinery, and incorrect manual handling cause most workplace incidents."},
            {"layout": "statement", "eyebrow": "Speak up",
             "title": "See something unsafe? Say something.",
             "sub": "Reporting a hazard early stops it becoming an accident.",
             "narration": "If you see something unsafe, say something. Reporting a hazard early stops it from becoming an accident."},
            {"layout": "recap", "eyebrow": "Before every shift",
             "title": "Your safety checklist",
             "items": ["Gear on", "Stay alert", "Report hazards"],
             "narration": "So before every shift: gear on, stay alert, and report any hazard you find."},
            {"layout": "close", "eyebrow": "A TVMG sample",
             "title": "Safety training that sticks.",
             "sub": "Engaging induction your team will remember.",
             "narration": "That was a snippet of the engaging safety training that T V M G can build for your team."},
        ],
    },
    {
        "id": "fire",
        "theme": "t3",
        "voice": "mapendo",
        "accent_name": "South African English",
        "topic_label": "Emergency preparedness",
        "menu_title": "Fire Safety & Evacuation",
        "menu_sub": "Know your plan before you need it",
        "slides": [
            {"layout": "cover", "eyebrow": "Emergency preparedness",
             "title": "Fire Safety & Evacuation",
             "sub": "Know your plan before you need it",
             "narration": "In an emergency, seconds matter. Let's cover fire safety, and how to evacuate safely."},
            {"layout": "statement", "eyebrow": "Prevent first",
             "title": "Most fires are preventable",
             "sub": "Keep exits clear and report faulty equipment.",
             "narration": "Prevention always comes first. Keep fire exits clear at all times, and report any faulty or overheating equipment."},
            {"layout": "steps", "eyebrow": "When the alarm sounds",
             "title": "Act calmly, act fast",
             "items": ["Stop what you're doing", "Leave the building calmly", "Never use the lifts"],
             "narration": "If the alarm sounds, stop what you are doing, leave the building calmly, and never use the lifts."},
            {"layout": "statement", "eyebrow": "Find your way out",
             "title": "Follow the green route",
             "sub": "Move to your nearest marked exit and assembly point.",
             "narration": "Follow the green emergency signs to your nearest marked exit, and make your way to the assembly point."},
            {"layout": "statement", "eyebrow": "At the assembly point",
             "title": "Stay put. Get counted.",
             "sub": "Never go back inside for belongings.",
             "narration": "At the assembly point, stay together and wait to be counted. Never go back inside for your belongings."},
            {"layout": "recap", "eyebrow": "Remember the order",
             "title": "Three steps that save lives",
             "items": ["Alert", "Exit", "Assemble"],
             "narration": "So remember the order. Alert, exit, and assemble. Calm and quick saves lives."},
            {"layout": "close", "eyebrow": "A TVMG sample",
             "title": "Training that could save a life.",
             "sub": "Premium emergency training, ready for your workplace.",
             "narration": "This snippet shows the premium emergency training that T V M G produces, ready for your workplace."},
        ],
    },
]
