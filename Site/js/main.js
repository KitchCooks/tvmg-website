/* =========================================================================
   TVMG — site interactions
   - sticky header state
   - mobile nav
   - scroll reveal (IntersectionObserver, respects reduced-motion)
   - enquiry form: validation, pluggable submission, success state
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     FORM ENDPOINT — plug in the real endpoint here.
     ---------------------------------------------------------------------
     Set FORM_ENDPOINT to your Formspree / Getform / Basin POST URL, e.g.
        var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
     Leave it null to use the mailto fallback (opens the user's mail client
     with a pre-filled enquiry to ENQUIRY_EMAIL).
     --------------------------------------------------------------------- */
  var FORM_ENDPOINT = null; /* TODO: paste your form endpoint URL here */
  var ENQUIRY_EMAIL = "hello@tvmg.co.za"; /* TODO: confirm real enquiry inbox */

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---- Prefill the form's length dropdown when a pricing CTA is clicked ---- */
  document.querySelectorAll("[data-tier]").forEach(function (el) {
    el.addEventListener("click", function () {
      var tier = el.getAttribute("data-tier");
      var sel = document.getElementById("length");
      if (sel && tier) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === tier) { sel.selectedIndex = i; break; }
        }
      }
    });
  });

  /* ---- Featured sample viewer: click-through slides + narrated video ---- */
  var stage = document.querySelector(".work-stage");
  if (stage) {
    var SAMPLES = {
      popia:  { title: "Protecting Personal Information", n: 7, dir: "assets/videos/popia",  video: "assets/videos/tvmg_sample_popia.mp4" },
      safety: { title: "Workplace Safety Induction",      n: 7, dir: "assets/videos/safety", video: "assets/videos/tvmg_sample_safety.mp4" },
      fire:   { title: "Fire Safety & Evacuation",        n: 7, dir: "assets/videos/fire",   video: "assets/videos/tvmg_sample_fire.mp4" }
    };
    var slideImg = stage.querySelector(".work-slide");
    var nowEl = stage.querySelector(".work-now");
    var countEl = stage.querySelector(".work-count");
    var dotsEl = stage.querySelector(".work-dots");
    var current = "fire", index = 0;

    var pad = function (i) { return (i < 10 ? "0" : "") + i; };

    var clearVideo = function () {
      var v = stage.querySelector("video");
      if (v) v.remove();
      stage.classList.remove("playing");
    };

    var render = function () {
      var s = SAMPLES[current];
      slideImg.src = s.dir + "/slide_" + pad(index) + ".jpg";
      slideImg.alt = s.title + " — slide " + (index + 1) + " of " + s.n;
      nowEl.textContent = s.title;
      countEl.textContent = (index + 1) + " / " + s.n;
      dotsEl.querySelectorAll("button").forEach(function (d, i) {
        d.classList.toggle("on", i === index);
      });
    };

    var buildDots = function () {
      var s = SAMPLES[current];
      dotsEl.innerHTML = "";
      for (var i = 0; i < s.n; i++) {
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", (function (i) { return function () { clearVideo(); index = i; render(); }; })(i));
        dotsEl.appendChild(b);
      }
    };

    var go = function (dir) {
      clearVideo();
      var n = SAMPLES[current].n;
      index = (index + dir + n) % n; // wrap
      render();
    };

    var playNarrated = function () {
      var s = SAMPLES[current];
      clearVideo();
      var v = document.createElement("video");
      v.setAttribute("controls", ""); v.setAttribute("playsinline", "");
      v.setAttribute("preload", "auto");
      v.poster = s.dir + "/slide_00.jpg";
      v.src = s.video;
      stage.insertBefore(v, stage.firstChild);
      stage.classList.add("playing");
      v.addEventListener("ended", function () { stage.classList.remove("playing"); });
      v.play();
    };

    stage.querySelector(".work-prev").addEventListener("click", function () { go(-1); });
    stage.querySelector(".work-next").addEventListener("click", function () { go(1); });
    stage.querySelector(".work-play").addEventListener("click", playNarrated);

    // keyboard arrows when the viewer is focused/hovered
    stage.setAttribute("tabindex", "0");
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(-1); } else if (e.key === "ArrowRight") { go(1); }
    });

    document.querySelectorAll(".work-thumb").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        document.querySelectorAll(".work-thumb").forEach(function (t) {
          t.classList.remove("is-active"); t.setAttribute("aria-selected", "false");
        });
        thumb.classList.add("is-active"); thumb.setAttribute("aria-selected", "true");
        current = thumb.getAttribute("data-id"); index = 0;
        clearVideo(); buildDots(); render();
      });
    });

    buildDots(); render();
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Enquiry form ---- */
  var form = document.querySelector(".enquiry-form");
  if (!form) return;

  var successPanel = document.getElementById("form-success");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var markInvalid = function (field, invalid) {
    if (field) field.classList.toggle("invalid", invalid);
  };

  var validate = function () {
    var ok = true;
    [
      ["name", function (v) { return v.trim().length > 1; }],
      ["business", function (v) { return v.trim().length > 0; }],
      ["email", function (v) { return emailRe.test(v.trim()); }],
      ["phone", function (v) { return v.trim().length > 5; }],
      ["message", function (v) { return v.trim().length > 2; }]
    ].forEach(function (pair) {
      var input = form.elements[pair[0]];
      var wrap = input ? input.closest(".field") : null;
      var valid = input && pair[1](input.value);
      markInvalid(wrap, !valid);
      if (!valid) ok = false;
    });

    var terms = form.elements["terms"];
    var termsWrap = terms ? terms.closest(".checkbox") : null;
    if (terms && !terms.checked) { markInvalid(termsWrap, true); ok = false; }
    else { markInvalid(termsWrap, false); }

    return ok;
  };

  var showSuccess = function () {
    form.style.display = "none";
    if (successPanel) {
      successPanel.classList.add("show");
      successPanel.setAttribute("tabindex", "-1");
      successPanel.focus();
    }
  };

  /* mailto fallback — builds a pre-filled email if no endpoint is configured */
  var mailtoFallback = function (data) {
    var subject = "Website enquiry — " + (data.business || data.name || "TVMG");
    var bodyLines = [
      "Name: " + data.name,
      "Business: " + data.business,
      "Email: " + data.email,
      "Phone: " + data.phone,
      "Video length: " + (data.length || "—"),
      "Best time to call: " + (data.calltime || "—"),
      "",
      "What they need:",
      data.message,
      "",
      "(Terms & Conditions accepted at submission.)"
    ];
    window.location.href = "mailto:" + ENQUIRY_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(bodyLines.join("\n"));
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      var firstInvalid = form.querySelector(".invalid input, .invalid textarea, .invalid select");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (v, k) { data[k] = v; });
    data.terms_accepted = "yes";
    data.terms_accepted_at = new Date().toISOString(); /* records T&C acceptance time */

    var submitBtn = form.querySelector(".form-submit");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

    if (!FORM_ENDPOINT) {
      // No endpoint configured yet → mailto fallback, then show success.
      mailtoFallback(data);
      showSuccess();
      return;
    }

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Bad response");
        showSuccess();
      })
      .catch(function () {
        // Network/endpoint failure → fall back to mailto so the lead is never lost.
        mailtoFallback(data);
        showSuccess();
      });
  });
})();
