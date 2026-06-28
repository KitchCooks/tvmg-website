/* =========================================================================
   TVMG Client Intake — Supabase Storage + Database + auto brief.md
   ------------------------------------------------------------------------
   SETUP (one time):
   1) In Supabase, run supabase/intake_setup.sql (SQL Editor).
   2) Project Settings -> API: copy the Project URL and the anon public key.
   3) Paste them below.  (The anon key is safe to ship: RLS lets the form
      INSERT/upload only, never read.)
   ========================================================================= */
var SUPABASE_URL = "https://vrdnubvpbyogpseyleti.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZG51YnZwYnlvZ3BzZXlsZXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjE0MzAsImV4cCI6MjA5ODE5NzQzMH0.vT2ZzK0rVFYNMR_QdElin45bJFxqqQ2eO3sOx6RGYfI";
var BUCKET = "intake";

(function () {
  "use strict";
  var form = document.getElementById("intake-form");
  if (!form) return;

  var statusEl = document.getElementById("intake-status");
  var submitBtn = document.getElementById("intake-submit");
  var successEl = document.getElementById("intake-success");
  var configured = SUPABASE_URL && SUPABASE_ANON_KEY;
  var sb = (configured && window.supabase)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  if (!configured) {
    var warn = document.getElementById("intake-config-warning");
    if (warn) warn.hidden = false;
  }

  var MAX_BYTES = 50 * 1024 * 1024; // 50 MB per file (matches bucket limit)
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- conditional fields ---------- */
  function toggle(wrapId, show) {
    var wrap = document.getElementById(wrapId);
    if (wrap) wrap.hidden = !show;
  }
  // selects
  form.querySelectorAll("select[data-controls]").forEach(function (sel) {
    var on = sel.getAttribute("data-show-on");
    var apply = function () { toggle(sel.getAttribute("data-controls"), sel.value === on); };
    sel.addEventListener("change", apply); apply();
  });
  // checkbox group (languages -> Other)
  form.querySelectorAll(".check-group[data-controls]").forEach(function (grp) {
    var on = grp.getAttribute("data-show-on");
    var apply = function () {
      var box = grp.querySelector('input[value="' + on + '"]');
      toggle(grp.getAttribute("data-controls"), !!(box && box.checked));
    };
    grp.addEventListener("change", apply); apply();
  });
  // radio groups (branded / portal -> Yes)
  form.querySelectorAll(".radio-group[data-controls]").forEach(function (grp) {
    var on = grp.getAttribute("data-show-on");
    var apply = function () {
      var r = grp.querySelector("input:checked");
      toggle(grp.getAttribute("data-controls"), !!(r && r.value === on));
    };
    grp.addEventListener("change", apply); apply();
  });

  /* ---------- file pickers: ACCUMULATE across multiple picks + remove + size guard ----------
     A native multi-file input replaces its selection each time you choose, so people think
     they can only upload one batch. We keep our own list, append on each pick, let them
     remove items, and sync it back onto the input so the rest of the code reads input.files. */
  function wireFileList(inputId, listId) {
    var input = document.getElementById(inputId);
    var list = document.getElementById(listId);
    if (!input || !list) return;

    var sync = function () {
      // rebuild input.files from `list` data via DataTransfer (supported in modern browsers)
      try {
        var dt = new DataTransfer();
        store.forEach(function (f) { dt.items.add(f); });
        input.files = dt.files;
      } catch (e) { /* very old browser: input keeps its last native selection */ }
    };
    var store = [];
    var key = function (f) { return f.name + "|" + f.size + "|" + f.lastModified; };

    var render = function () {
      list.innerHTML = "";
      store.forEach(function (f, i) {
        var li = document.createElement("li");
        var tooBig = f.size > MAX_BYTES;
        li.className = tooBig ? "over" : "";
        var span = document.createElement("span");
        span.textContent = f.name + " (" + (f.size / 1048576).toFixed(1) + " MB)" + (tooBig ? " — too large, max 50 MB" : "");
        var rm = document.createElement("button");
        rm.type = "button"; rm.className = "file-remove"; rm.setAttribute("aria-label", "Remove " + f.name);
        rm.innerHTML = "&times;";
        rm.addEventListener("click", function () { store.splice(i, 1); sync(); render(); });
        li.appendChild(span); li.appendChild(rm);
        list.appendChild(li);
      });
    };

    input.addEventListener("change", function () {
      var seen = {};
      store.forEach(function (f) { seen[key(f)] = true; });
      Array.prototype.forEach.call(input.files, function (f) {
        if (!seen[key(f)]) { store.push(f); seen[key(f)] = true; }
      });
      sync();   // input.files now holds the full accumulated set
      render();
    });
  }
  wireFileList("source_files", "source_files_list");
  wireFileList("brand_files", "brand_files_list");
  wireFileList("image_files", "image_files_list");

  /* ---------- validation ---------- */
  function setInvalid(el, bad) {
    var wrap = el.closest(".field, .checkbox, .conditional");
    if (wrap) wrap.classList.toggle("invalid", bad);
    return !bad;
  }
  function visible(el) { var w = el.closest("[hidden]"); return !w; }
  function val(name) { var el = form.elements[name]; return el ? String(el.value || "").trim() : ""; }
  function filesOf(id) { var el = document.getElementById(id); return el && el.files ? el.files : []; }

  function validate() {
    var ok = true, firstBad = null;
    function fail(el) { ok = false; if (!firstBad) firstBad = el; }

    // simple required text/select/email/tel/date
    var required = ["business_name","contact_name","email","phone","quote_ref","package",
      "video_title","length_tier","purpose","audience","learning_outcome",
      "section_breakdown","voice_pref","accent_pref","tone","deadline","approver"];
    required.forEach(function (name) {
      var el = form.elements[name]; if (!el) return;
      var good = !!val(name);
      if (name === "email") good = emailRe.test(val(name));
      setInvalid(el, !good); if (!good) fail(el);
    });

    // conditional requireds (only when visible)
    [["purpose","Other","purpose_other"],
     ["accent_pref","Other","accent_other"]].forEach(function (t) {
      if (val(t[0]) === t[1]) {
        var el = form.elements[t[2]]; var good = !!val(t[2]);
        setInvalid(el, !good); if (!good) fail(el);
      }
    });

    // languages: at least one
    var langs = form.querySelectorAll('input[name="languages"]:checked');
    var langGood = langs.length > 0;
    setInvalid(document.getElementById("languages_group"), !langGood);
    if (!langGood) fail(document.getElementById("languages_group"));
    // language other
    var otherLang = form.querySelector('input[name="languages"][value="Other"]');
    if (otherLang && otherLang.checked) {
      var lo = form.elements["language_other"]; var g = !!val("language_other");
      setInvalid(lo, !g); if (!g) fail(lo);
    }

    // branded radio
    var branded = form.querySelector('input[name="branded"]:checked');
    setInvalid(document.getElementById("branded_group"), !branded);
    if (!branded) fail(document.getElementById("branded_group"));

    // portal radio
    var portal = form.querySelector('input[name="portal_purchased"]:checked');
    setInvalid(document.getElementById("portal_group"), !portal);
    if (!portal) fail(document.getElementById("portal_group"));

    // SECTION 3 content rule: at least source files OR pasted content OR a large-file link
    var hasFiles = filesOf("source_files").length > 0;
    var hasPaste = !!val("content_pasted");
    var hasLink = !!val("large_links");
    var contentGood = hasFiles || hasPaste || hasLink;
    setInvalid(document.getElementById("source_files"), !contentGood);
    if (!contentGood) fail(document.getElementById("source_files"));

    // file size guard across all pickers
    ["source_files","brand_files","image_files"].forEach(function (id) {
      Array.prototype.forEach.call(filesOf(id), function (f) {
        if (f.size > MAX_BYTES) { setInvalid(document.getElementById(id), true); fail(document.getElementById(id)); }
      });
    });

    // checkboxes
    ["confirm_content","accept_terms"].forEach(function (name) {
      var el = form.elements[name]; var good = el && el.checked;
      setInvalid(el, !good); if (!good) fail(el);
    });

    if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    if (firstBad && firstBad.focus) try { firstBad.focus({ preventScroll: true }); } catch (e) {}
    return ok;
  }

  /* ---------- helpers ---------- */
  function slugify(s) {
    return String(s || "client").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "client";
  }
  function safeName(n) { return String(n).replace(/[^a-zA-Z0-9._-]+/g, "_"); }
  function shortId() {
    var t = Date.now().toString(36);
    var r = Math.floor(Math.random() * 1e6).toString(36);
    return t + r;
  }
  function checkedLangs() {
    return Array.prototype.map.call(form.querySelectorAll('input[name="languages"]:checked'), function (c) { return c.value; });
  }

  function buildBrief(rec, filePaths, slug) {
    var L = [];
    L.push("# Production brief — " + (rec.video_title || rec.business_name));
    L.push("");
    L.push("> Auto-generated from the TVMG intake form. Client folder: `" + slug + "/`");
    L.push("");
    L.push("## Project");
    L.push("- **Business:** " + (rec.business_name || ""));
    L.push("- **Contact:** " + (rec.contact_name || "") + " — " + (rec.email || "") + " — " + (rec.phone || ""));
    L.push("- **Quote / invoice ref:** " + (rec.quote_ref || ""));
    L.push("- **Package:** " + (rec.package || ""));
    L.push("- **Deadline:** " + (rec.deadline || "") + "   |   **Approver:** " + (rec.approver || ""));
    L.push("");
    L.push("## Video");
    L.push("- **Title / topic:** " + (rec.video_title || ""));
    L.push("- **Length tier:** " + (rec.length_tier || ""));
    L.push("- **Purpose:** " + (rec.purpose === "Other" ? rec.purpose_other : rec.purpose));
    L.push("- **Audience:** " + (rec.audience || ""));
    L.push("- **Learning outcome:** " + (rec.learning_outcome || ""));
    L.push("");
    L.push("## Content");
    L.push("### Section-by-section breakdown");
    L.push(rec.section_breakdown || "_(none provided)_");
    if (rec.content_pasted) { L.push(""); L.push("### Pasted content / key points"); L.push(rec.content_pasted); }
    if (rec.must_include) { L.push(""); L.push("### Must include word-for-word"); L.push(rec.must_include); }
    if (rec.avoid_text) { L.push(""); L.push("### Avoid / leave out"); L.push(rec.avoid_text); }
    L.push("");
    L.push("## Voice & language");
    L.push("- **Languages:** " + ((rec.languages || []).join(", ")) + (rec.language_other ? (" (other: " + rec.language_other + ")") : ""));
    L.push("- **Voice:** " + (rec.voice_pref || "") + "   |   **Accent:** " + (rec.accent_pref === "Other" ? rec.accent_other : rec.accent_pref));
    L.push("- **Tone:** " + (rec.tone || ""));
    L.push("");
    L.push("## Branding");
    L.push("- **Branded to business:** " + (rec.branded || ""));
    if (rec.brand_colours) L.push("- **Brand colours:** " + rec.brand_colours);
    if (rec.visual_prefs) L.push("- **Visual preferences:** " + rec.visual_prefs);
    L.push("");
    L.push("## Portal");
    L.push("- **Purchased:** " + (rec.portal_purchased || ""));
    if (rec.portal_seats) L.push("- **Seats:** " + rec.portal_seats);
    if (rec.portal_notes) L.push("- **Setup notes:** " + rec.portal_notes);
    L.push("");
    L.push("## Files");
    L.push("Storage bucket `" + BUCKET + "`, folder `" + slug + "/`:");
    if (filePaths.length) filePaths.forEach(function (p) { L.push("- " + p); });
    else L.push("- _(no files uploaded)_");
    if (rec.large_file_links) L.push("- **Large-file link (client-provided):** " + rec.large_file_links);
    L.push("");
    L.push("## Sign-off");
    L.push("- Confirmed content provided: " + (rec.confirm_content ? "yes" : "no"));
    L.push("- Accepted terms: " + (rec.accept_terms ? "yes" : "no"));
    L.push("- Submitted: " + new Date().toISOString());
    return L.join("\n");
  }

  /* ---------- upload progress bar ---------- */
  var progress = (function () {
    var wrap = document.createElement("div"); wrap.className = "upload-progress"; wrap.hidden = true;
    var label = document.createElement("div"); label.className = "up-label";
    var track = document.createElement("div"); track.className = "up-track";
    var fill = document.createElement("div"); fill.className = "up-fill";
    track.appendChild(fill); wrap.appendChild(label); wrap.appendChild(track);
    if (submitBtn && submitBtn.parentNode) submitBtn.parentNode.insertBefore(wrap, submitBtn.nextSibling);
    return {
      show: function () { wrap.hidden = false; },
      hide: function () { wrap.hidden = true; },
      set: function (frac, text) {
        fill.style.width = Math.max(2, Math.min(100, Math.round(frac * 100))) + "%";
        if (text != null) label.textContent = text;
      }
    };
  })();

  /* ---------- submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    if (!sb) {
      statusEl.textContent = "This form isn't connected to its backend yet. Please contact TVMG directly.";
      statusEl.classList.add("err");
      return;
    }

    var slug = slugify(val("business_name")) + "-" + shortId();
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    statusEl.classList.remove("err");
    statusEl.textContent = "";
    progress.show();

    var uploads = [
      { id: "source_files", sub: "01-source-content" },
      { id: "brand_files",  sub: "02-branding" },
      { id: "image_files",  sub: "03-images-media" }
    ];
    var filePaths = [], fileJobs = [];
    uploads.forEach(function (u) {
      Array.prototype.forEach.call(filesOf(u.id), function (f) {
        var path = slug + "/" + u.sub + "/" + safeName(f.name);
        filePaths.push(path);
        fileJobs.push({ path: path, file: f });
      });
    });
    var totalSteps = fileJobs.length + 2;  // files + brief + db insert
    var done = 0;

    var rec = {
      client_slug: slug,
      business_name: val("business_name"), contact_name: val("contact_name"),
      email: val("email"), phone: val("phone"), quote_ref: val("quote_ref"), package: val("package"),
      video_title: val("video_title"), length_tier: val("length_tier"),
      purpose: val("purpose"), purpose_other: val("purpose_other"),
      audience: val("audience"), learning_outcome: val("learning_outcome"),
      content_pasted: val("content_pasted"), large_file_links: val("large_links"),
      section_breakdown: val("section_breakdown"),
      must_include: val("must_include"), avoid_text: val("avoid_text"),
      languages: checkedLangs(), language_other: val("language_other"),
      voice_pref: val("voice_pref"), accent_pref: val("accent_pref"), accent_other: val("accent_other"),
      tone: val("tone"),
      branded: (form.querySelector('input[name="branded"]:checked') || {}).value || "",
      brand_colours: val("brand_colours"), visual_prefs: val("visual_prefs"),
      portal_purchased: (form.querySelector('input[name="portal_purchased"]:checked') || {}).value || "",
      portal_seats: val("portal_seats") ? parseInt(val("portal_seats"), 10) : null,
      portal_notes: val("portal_notes"),
      deadline: val("deadline") || null, approver: val("approver"),
      confirm_content: !!form.elements["confirm_content"].checked,
      accept_terms: !!form.elements["accept_terms"].checked
    };

    progress.set(0, fileJobs.length ? ("Uploading files… (0 of " + fileJobs.length + ")") : "Saving your details…");

    // Upload files one at a time so the bar advances visibly.
    var chain = Promise.resolve();
    fileJobs.forEach(function (job, i) {
      chain = chain.then(function () {
        progress.set(done / totalSteps, "Uploading " + job.file.name + " (" + (i + 1) + " of " + fileJobs.length + ")…");
        return sb.storage.from(BUCKET).upload(job.path, job.file, { upsert: false, contentType: job.file.type || undefined })
          .then(function (r) { if (r.error) throw r.error; done++; progress.set(done / totalSteps); });
      });
    });

    chain
      .then(function () {
        progress.set(done / totalSteps, "Saving your brief…");
        var brief = buildBrief(rec, filePaths, slug);
        var briefPath = slug + "/brief.md";
        return sb.storage.from(BUCKET).upload(briefPath, new Blob([brief], { type: "text/markdown" }), { upsert: true })
          .then(function (r) { if (r.error) throw r.error; rec.files = filePaths; rec.brief_path = briefPath; done++; progress.set(done / totalSteps); });
      })
      .then(function () {
        progress.set(done / totalSteps, "Saving your details…");
        return sb.from("intake_submissions").insert(rec).then(function (r) { if (r.error) throw r.error; done++; progress.set(1, "Done"); });
      })
      .then(function () {
        progress.hide();
        form.style.display = "none";
        var steps = document.querySelector(".intake-steps"); if (steps) steps.style.display = "none";
        successEl.classList.add("show");
        successEl.setAttribute("tabindex", "-1");
        successEl.scrollIntoView({ behavior: "smooth", block: "center" });
        successEl.focus();
      })
      .catch(function (err) {
        progress.hide();
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit project intake";
        statusEl.classList.add("err");
        statusEl.textContent = "Something went wrong: " +
          ((err && err.message) ? err.message : "please try again, or contact TVMG directly.");
      });
  });
})();
