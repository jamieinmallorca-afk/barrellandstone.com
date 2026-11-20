// Mobile nav
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    });
  }
})();

// Revenue calculator (for-pubs page)
(function () {
  var q = document.getElementById('c-qty');
  if (!q) return;
  var p = document.getElementById('c-price');
  var m = document.getElementById('c-margin');
  var w = document.getElementById('c-week');
  var y = document.getElementById('c-year');
  var gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  function calc() {
    var qty = Math.max(0, parseFloat(q.value) || 0);
    var price = Math.max(0, parseFloat(p.value) || 0);
    var margin = Math.min(100, Math.max(0, parseFloat(m.value) || 0)) / 100;
    var week = qty * price * margin;
    w.textContent = gbp.format(week);
    y.textContent = gbp.format(week * 52);
  }
  [q, p, m].forEach(function (el) { el.addEventListener('input', calc); });
  calc();
})();
