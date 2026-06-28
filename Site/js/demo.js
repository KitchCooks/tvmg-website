/* =========================================================================
   TVMG Demo Request — Supabase (separate table + bucket from paid intake)
   Setup: run supabase/demo_setup.sql, then keep the same project URL + anon key
   as the intake form below.
   ========================================================================= */
var SUPABASE_URL = "https://vrdnubvpbyogpseyleti.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZG51YnZwYnlvZ3BzZXlsZXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjE0MzAsImV4cCI6MjA5ODE5NzQzMH0.vT2ZzK0rVFYNMR_QdElin45bJFxqqQ2eO3sOx6RGYfI";
var BUCKET = "demos";
var TABLE = "demo_requests";

(function () {
  "use strict";
  var form = document.getElementById("demo-form");
  if (!form) return;

  var statusEl = document.getElementById("demo-status");
  var submitBtn = document.getElementById("demo-submit");
  var successEl = document.getElementById("demo-success");
  var configured = SUPABASE_URL && SUPABASE_ANON_KEY;
  var sb = (configured && window.supabase) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  if (!configured) { var w = document.getElementById("demo-config-warning"); if (w) w.hidden = false; }

  var MAX_BYTES = 50 * 1024 * 1024;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* conditional: language Other */
  form.querySelectorAll("select[data-controls]").forEach(function (sel) {
    var on = sel.getAttribute("data-show-on");
    var apply = function () {
      var wrap = document.getElementById(sel.getAttribute("data-controls"));
      if (wrap) wrap.hidden = sel.value !== on;
    };
    sel.addEventListener("change", apply); apply();
  });

  /* file lists: accumulate across multiple picks + remove + size guard */
  function wireFileList(inputId, listId) {
    var input = document.getElementById(inputId), list = document.getElementById(listId);
    if (!input || !list) return;
    var store = [];
    var key = function (f) { return f.name + "|" + f.size + "|" + f.lastModified; };
    var sync = function () {
      try { var dt = new DataTransfer(); store.forEach(function (f) { dt.items.add(f); }); input.files = dt.files; } catch (e) {}
    };
    var render = function () {
      list.innerHTML = "";
      store.forEach(function (f, i) {
        var li = document.createElement("li"), big = f.size > MAX_BYTES;
        li.className = big ? "over" : "";
        var span = document.createElement("span");
        span.textContent = f.name + " (" + (f.size / 1048576).toFixed(1) + " MB)" + (big ? " — too large, max 50 MB" : "");
        var rm = document.createElement("button");
        rm.type = "button"; rm.className = "file-remove"; rm.setAttribute("aria-label", "Remove " + f.name); rm.innerHTML = "&times;";
        rm.addEventListener("click", function () { store.splice(i, 1); sync(); render(); });
        li.appendChild(span); li.appendChild(rm); list.appendChild(li);
      });
    };
    input.addEventListener("change", function () {
      var seen = {}; store.forEach(function (f) { seen[key(f)] = true; });
      Array.prototype.forEach.call(input.files, function (f) { if (!seen[key(f)]) { store.push(f); seen[key(f)] = true; } });
      sync(); render();
    });
  }
  wireFileList("content_files", "content_files_list");
  wireFileList("logo_file", "logo_file_list");

  /* helpers */
  function val(n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; }
  function filesOf(id) { var el = document.getElementById(id); return el && el.files ? el.files : []; }
  function setInvalid(el, bad) { var w = el.closest(".field, .checkbox"); if (w) w.classList.toggle("invalid", bad); }
  function slugify(s) { return String(s || "lead").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "lead"; }
  function safeName(n) { return String(n).replace(/[^a-zA-Z0-9._-]+/g, "_"); }
  function shortId() { return Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8); return v.toString(16);
    });
  }

  /* validation */
  function validate() {
    var ok = true, firstBad = null;
    function fail(el) { ok = false; if (!firstBad) firstBad = el; }

    ["business_name","contact_name","email","phone","topic","language","voice_pref","accent_pref"].forEach(function (n) {
      var el = form.elements[n]; if (!el) return;
      var good = !!val(n); if (n === "email") good = emailRe.test(val(n));
      setInvalid(el, !good); if (!good) fail(el);
    });

    var dt = form.querySelector('input[name="demo_type"]:checked');
    setInvalid(document.getElementById("demo_type_group"), !dt); if (!dt) fail(document.getElementById("demo_type_group"));

    if (val("language") === "Other") {
      var lo = form.elements["language_other"]; var g = !!val("language_other");
      setInvalid(lo, !g); if (!g) fail(lo);
    }

    // content rule: pasted content OR an uploaded file
    var hasPaste = !!val("content_pasted");
    var hasFiles = filesOf("content_files").length > 0;
    var good = hasPaste || hasFiles;
    setInvalid(form.elements["content_pasted"], !good); if (!good) fail(form.elements["content_pasted"]);

    ["content_files","logo_file"].forEach(function (id) {
      Array.prototype.forEach.call(filesOf(id), function (f) {
        if (f.size > MAX_BYTES) { setInvalid(document.getElementById(id), true); fail(document.getElementById(id)); }
      });
    });

    if (firstBad) { firstBad.scrollIntoView({ behavior: "smooth", block: "center" }); try { firstBad.focus({ preventScroll: true }); } catch (e) {} }
    return ok;
  }

  /* demo-brief.md */
  function buildBrief(rec, filePaths, slug, id) {
    var content = [];
    var src = filePaths.filter(function (p) { return p.indexOf("/content/") > -1; });
    var brand = filePaths.filter(function (p) { return p.indexOf("/branding/") > -1; });
    content.push("# TVMG DEMO Brief — " + (rec.business_name || ""));
    content.push("");
    content.push("## Lead");
    content.push("- Business: " + (rec.business_name || ""));
    content.push("- Contact: " + (rec.contact_name || "") + " / " + (rec.email || "") + " / " + (rec.phone || ""));
    content.push("- Submission ID: " + id);
    content.push("- Submitted: " + new Date().toISOString());
    content.push("");
    content.push("## Demo");
    content.push("- Demo type: " + (rec.demo_type || ""));
    content.push("- Topic/Title: " + (rec.topic || ""));
    content.push("- What they want to show / use case: " + (rec.use_case || "—"));
    content.push("");
    content.push("## Content (use to build the demo segment)");
    content.push("- Pasted content:");
    content.push(rec.content_pasted ? rec.content_pasted : "  (none — see source files)");
    content.push("- Source files: see /content/ (" + (src.length ? src.map(function (p) { return p.split("/").pop(); }).join(", ") : "none") + ")");
    content.push("");
    content.push("## Voice & Language");
    content.push("- Language: " + (rec.language || "") + (rec.language_other ? (" (" + rec.language_other + ")") : ""));
    content.push("- Voice: " + (rec.voice_pref || ""));
    content.push("- Accent: " + (rec.accent_pref || ""));
    content.push("");
    content.push("## Branding");
    content.push("- Logo provided: " + (brand.length ? "yes" : "no") + " — see /branding/ (" + (brand.length ? brand.map(function (p) { return p.split("/").pop(); }).join(", ") : "none") + ")");
    content.push("- Notes: " + (rec.brand_colours ? ("brand colours " + rec.brand_colours) : "—"));
    content.push("");
    content.push("## Files");
    content.push("- Folder: storage bucket `" + BUCKET + "`, `" + slug + "/`");
    // TODO: auto-forward this brief (email to myself / trigger production pipeline).
    return content.join("\n");
  }

  /* submit */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    if (!sb) { statusEl.textContent = "This form isn't connected yet. Please contact TVMG directly."; statusEl.classList.add("err"); return; }

    var id = uuid();
    var slug = slugify(val("business_name")) + "-" + shortId();
    submitBtn.disabled = true; statusEl.classList.remove("err"); statusEl.textContent = "Uploading…";

    var jobs = [], filePaths = [];
    Array.prototype.forEach.call(filesOf("content_files"), function (f) {
      var p = slug + "/content/" + safeName(f.name); filePaths.push(p);
      jobs.push(sb.storage.from(BUCKET).upload(p, f, { upsert: false, contentType: f.type || undefined }).then(function (r) { if (r.error) throw r.error; }));
    });
    Array.prototype.forEach.call(filesOf("logo_file"), function (f) {
      var p = slug + "/branding/" + safeName(f.name); filePaths.push(p);
      jobs.push(sb.storage.from(BUCKET).upload(p, f, { upsert: false, contentType: f.type || undefined }).then(function (r) { if (r.error) throw r.error; }));
    });

    var rec = {
      id: id, lead_slug: slug,
      business_name: val("business_name"), contact_name: val("contact_name"), email: val("email"), phone: val("phone"),
      demo_type: (form.querySelector('input[name="demo_type"]:checked') || {}).value || "",
      topic: val("topic"), use_case: val("use_case"),
      content_pasted: val("content_pasted"),
      language: val("language"), language_other: val("language_other"),
      voice_pref: val("voice_pref"), accent_pref: val("accent_pref"),
      brand_colours: val("brand_colours")
    };

    // uploads -> brief -> single insert (anon has insert-only; no read-back/update needed)
    Promise.all(jobs)
      .then(function () {
        statusEl.textContent = "Saving your brief…";
        var brief = buildBrief(rec, filePaths, slug, id);
        return sb.storage.from(BUCKET).upload(slug + "/demo-brief.md", new Blob([brief], { type: "text/markdown" }), { upsert: true })
          .then(function (r) { if (r.error) throw r.error; });
      })
      .then(function () {
        rec.files = filePaths; rec.brief_path = slug + "/demo-brief.md";
        return sb.from(TABLE).insert(rec).then(function (r) { if (r.error) throw r.error; });
      })
      .then(function () {
        form.style.display = "none";
        successEl.classList.add("show"); successEl.setAttribute("tabindex", "-1");
        successEl.scrollIntoView({ behavior: "smooth", block: "center" }); successEl.focus();
      })
      .catch(function (err) {
        submitBtn.disabled = false; statusEl.classList.add("err");
        statusEl.textContent = "Something went wrong: " + ((err && err.message) ? err.message : "please try again, or contact TVMG directly.");
      });
  });
})();
