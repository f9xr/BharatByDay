(function () {
  'use strict';

  var bar = document.getElementById('reading-progress');
  if (bar) {
    var onScroll = function () {
      var html = document.documentElement;
      var total = html.scrollHeight - html.clientHeight;
      var pct = total > 0 ? (html.scrollTop / total) * 100 : 0;
      bar.style.width = pct + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var topBtn = document.getElementById('back-to-top');
  if (topBtn) {
    window.addEventListener('scroll', function () {
      topBtn.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('pre').forEach(function (pre) {
    var block = pre.querySelector('code');
    if (!block) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    pre.classList.add('copyable');
    pre.appendChild(btn);
    btn.addEventListener('click', function () {
      var text = block.innerText;
      var done = function () { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { btn.textContent = 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy'; }, 1600); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = 'Copy failed'; setTimeout(function () { btn.textContent = 'Copy'; }, 1600); }
        document.body.removeChild(ta);
      }
    });
  });

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('bbd-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('bbd-theme', 'light');
      }
    });
  }
})();
