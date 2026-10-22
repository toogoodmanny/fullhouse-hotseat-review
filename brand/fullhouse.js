/* Fullhouse web system v0.1: behaviour for fullhouse.css. Load at the end of the page; no dependencies. */
(function () {
  // Ticker: authors write each item once; clone the set so the -50% crawl loops seamlessly.
  document.querySelectorAll('.fh-ticker__track').forEach(function (t) {
    Array.from(t.children).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); t.appendChild(k); });
  });

  // Quiz answers: one pressed per group.
  document.querySelectorAll('.fh-opts').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('.fh-opt'); if (!b) return;
      g.querySelectorAll('.fh-opt').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });

  // One-shot reveals ([data-fh] = write | stamp | spin) and count-ups ([data-fh-count]).
  // ponytail: only elements below the fold at load get armed, so the first frame is always complete.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  function count(el) {
    var n = +el.dataset.fhCount, t0 = performance.now();
    (function f(t) {
      var k = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))).toLocaleString('en-IN');
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  // An armed "write" note is fully clipped, and Chrome's IntersectionObserver counts the target's own
  // clip-path, so it would never fire. Watch its parent instead (watched maps observed node -> element).
  var watched = new Map();
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = watched.get(e.target); io.unobserve(e.target);
      if (el.dataset.fhCount) return count(el);
      el.classList.remove('fh-armed');
      requestAnimationFrame(function () { el.classList.add('fh-play'); });
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-fh],[data-fh-count]').forEach(function (el) {
    if (el.getBoundingClientRect().top <= innerHeight) return;
    if (el.dataset.fh) el.classList.add('fh-armed');
    var t = el.dataset.fh === 'write' ? el.parentElement : el;
    watched.set(t, el); io.observe(t);
  });
})();
