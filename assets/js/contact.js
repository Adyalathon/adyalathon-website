// Adyalathon — contact form.
// Posts the form as URL-encoded fields to a Google Apps Script web app
// (see apps-script/Code.gs). URL-encoded POSTs are "simple" requests, so the
// browser sends no CORS preflight, which Apps Script can't answer.
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var statusEl = document.getElementById("form-status");
  var button = form.querySelector("button[type=submit]");
  var loadedAt = Date.now();
  var endpoint = (window.ADYALATHON_CONFIG && window.ADYALATHON_CONFIG.FORM_ENDPOINT) || "";

  function field(k) { return form.elements.namedItem(k); }
  function val(k) { var el = field(k); return el ? String(el.value || "").trim() : ""; }

  function say(text, kind) {
    statusEl.textContent = text;
    statusEl.className = "form-status" + (kind ? " " + kind : "");
  }

  function valid() {
    if (!val("name")) { field("name").focus(); return "Please add your name."; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) { field("email").focus(); return "Please add a valid email address."; }
    if (val("message").length < 10) { field("message").focus(); return "Please add a short message (10 characters or more)."; }
    return "";
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var problem = valid();
    if (problem) { say(problem, "err"); return; }

    if (!endpoint) {
      say("The contact form isn't connected yet. Please check back soon.", "err");
      return;
    }

    var data = new URLSearchParams();
    ["name", "email", "company", "topic", "message", "website"].forEach(function (k) {
      data.append(k, val(k));
    });
    data.append("elapsed", String(Date.now() - loadedAt));
    data.append("page", location.href);

    button.disabled = true;
    say("Sending…");

    fetch(endpoint, { method: "POST", body: data })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) {
          form.reset();
          loadedAt = Date.now();
          say("Thanks, your message was sent. We'll be in touch soon.", "ok");
        } else {
          say((res && res.error) || "Something went wrong. Please try again.", "err");
        }
      })
      .catch(function () {
        say("The message couldn't be sent. Please try again in a moment.", "err");
      })
      .then(function () { button.disabled = false; });
  });
})();
