(function () {
  'use strict';

  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var count = document.getElementById('search-count');
  if (!input || !results) return;

  var indexUrl = results.getAttribute('data-index') || 'search.json';

  var params = new URLSearchParams(window.location.search);
  var initial = (params.get('q') || '').trim();
  if (initial) input.value = initial;

  var posts = [];
  fetch(indexUrl)
    .then(function (r) { return r.json(); })
    .then(function (data) { posts = data; if (initial) render(initial); })
    .catch(function () { results.innerHTML = '<p class="search-empty">The search index could not be loaded. Please try again later.</p>'; });

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { render(input.value.trim()); }, 150);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); render(input.value.trim()); }
  });

  function render(q) {
    if (!q) {
      results.innerHTML = '';
      if (count) count.textContent = '';
      return;
    }
    var terms = q.toLowerCase().split(/\s+/);
    var found = posts.filter(function (p) {
      var hay = (p.title + ' ' + (p.tags || []).join(' ') + ' ' + p.excerpt + ' ' + p.content).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    });

    if (count) {
      count.textContent = found.length + ' result' + (found.length === 1 ? '' : 's') + ' for "' + q + '"';
    }

    if (found.length === 0) {
      results.innerHTML = '<p class="search-empty">No gems match your search. Try "Rajasthan", "trekking" or "stepwell".</p>';
      return;
    }

    results.innerHTML = found.map(function (p) {
      var snippet = p.excerpt || p.content || '';
      if (snippet.length > 180) snippet = snippet.slice(0, 180) + '…';
      var tags = (p.tags || []).map(function (t) {
        return '<span class="chip">' + esc(t) + '</span>';
      }).join(' ');
      return '<article class="search-result">' +
        '<h3 class="search-result-title"><a href="' + p.url + '">' + esc(p.title) + '</a></h3>' +
        '<p class="search-meta">' + esc(p.date) + (tags ? ' · ' + tags : '') + '</p>' +
        (snippet ? '<p class="search-snippet">' + esc(snippet) + '</p>' : '') +
        '</article>';
    }).join('');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
