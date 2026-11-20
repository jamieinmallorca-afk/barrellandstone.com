(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('#venues .venue'));
  var input = document.getElementById('q');
  var count = document.getElementById('result-count');
  var empty = document.getElementById('empty');
  var locate = document.getElementById('locate');
  var markers = {};
  var map = null;

  if (window.L) {
    map = L.map('map', { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    var icon = L.divIcon({ className: 'map-pin', iconSize: [18, 18] });
    items.forEach(function (li) {
      var mk = L.marker([+li.dataset.lat, +li.dataset.lng], { icon: icon, title: li.querySelector('.venue-name').textContent })
        .addTo(map)
        .bindPopup('<strong>' + li.querySelector('.venue-name').textContent + '</strong>');
      mk.on('click', function () { highlight(li); });
      markers[li.dataset.id] = mk;
    });
  }

  function highlight(li) {
    items.forEach(function (x) { x.classList.remove('active'); });
    li.classList.add('active');
    li.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function fit(visible) {
    if (!map) return;
    var pts = visible.map(function (li) { return [+li.dataset.lat, +li.dataset.lng]; });
    if (pts.length === 1) map.setView(pts[0], 13);
    else if (pts.length) map.fitBounds(pts, { padding: [30, 30] });
  }

  function filter() {
    var term = (input.value || '').trim().toLowerCase();
    var visible = items.filter(function (li) {
      var show = !term || li.dataset.search.indexOf(term) !== -1;
      li.hidden = !show;
      var mk = markers[li.dataset.id];
      if (mk && map) { if (show) mk.addTo(map); else mk.remove(); }
      return show;
    });
    empty.hidden = visible.length > 0;
    count.textContent = term
      ? visible.length + (visible.length === 1 ? ' pub' : ' pubs') + ' matching "' + input.value.trim() + '"'
      : visible.length + ' pubs serving Barrel & Stone';
    fit(visible.length ? visible : items);
  }

  input.addEventListener('input', filter);
  input.form.addEventListener('submit', function (e) { e.preventDefault(); filter(); });
  filter();

  function km(a, b, c, d) {
    var r = Math.PI / 180, R = 6371;
    var x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2);
    return 2 * R * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y));
  }

  if (locate) {
    if (!('geolocation' in navigator)) { locate.hidden = true; return; }
    locate.addEventListener('click', function () {
      locate.textContent = 'Finding you...';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude, lng = pos.coords.longitude;
        input.value = '';
        items.forEach(function (li) {
          var miles = km(lat, lng, +li.dataset.lat, +li.dataset.lng) * 0.621;
          li.dataset.dist = miles;
          li.querySelector('.distance').textContent = miles.toFixed(1) + ' miles away';
        });
        items.sort(function (a, b) { return a.dataset.dist - b.dataset.dist; });
        var list = document.getElementById('venues');
        items.forEach(function (li) { list.appendChild(li); });
        filter();
        fit(items.slice(0, 3));
        locate.textContent = 'Use my location';
      }, function () {
        locate.textContent = 'Use my location';
        count.textContent = 'We couldn’t get your location. Search by town or postcode instead.';
      }, { timeout: 8000 });
    });
  }
})();
