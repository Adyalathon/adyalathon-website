// Adyalathon — shared page behaviour: light/dark toggle and footer year.
(function () {
  var root = document.documentElement;
  var KEY = "adyalathon-theme";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: ignore */ }
  }
  function current() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  var saved = stored();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      var paint = function () {
        var dark = current() === "dark";
        btn.textContent = dark ? "☀" : "☾";
        btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      };
      paint();
      btn.addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        store(next);
        paint();
      });
    }
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
