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
      copyText(block.innerText, function (ok) {
        btn.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
      });
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

  /* ---------- Shared helpers ---------- */

  function copyText(text, cb) {
    var done = function (ok) { if (cb) cb(ok); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { done(document.execCommand('copy')); } catch (e) { done(false); }
      document.body.removeChild(ta);
    }
  }

  function wireCopyLink(btn, flashEl) {
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      copyText(window.location.href, function (ok) {
        if (flashEl) {
          var old = flashEl.textContent;
          flashEl.textContent = ok ? 'Copied!' : 'Copy failed';
          setTimeout(function () { flashEl.textContent = old; }, 1800);
        }
      });
    });
  }
  wireCopyLink(document.getElementById('share-copy-link'), document.getElementById('share-copy-label'));
  wireCopyLink(document.getElementById('post-copy-link'), document.getElementById('post-copy-label'));

  /* ---------- Font size controls ---------- */

  var postContent = document.querySelector('.post-content');
  if (postContent) {
    var scale = parseFloat(localStorage.getItem('bbd-font-scale')) || 1;
    if (scale < 0.8 || scale > 1.6) scale = 1;
    var applyScale = function () {
      postContent.style.setProperty('--fs', String(scale));
      localStorage.setItem('bbd-font-scale', String(scale));
    };
    applyScale();
    var inc = document.getElementById('font-inc');
    var dec = document.getElementById('font-dec');
    if (inc) inc.addEventListener('click', function () {
      scale = Math.min(1.6, Math.round((scale + 0.1) * 10) / 10);
      applyScale();
    });
    if (dec) dec.addEventListener('click', function () {
      scale = Math.max(0.8, Math.round((scale - 0.1) * 10) / 10);
      applyScale();
    });
  }

  /* ---------- Listen to article (speech synthesis) ---------- */

  var listenBtn = document.getElementById('listen-btn');
  if (listenBtn) {
    var listenLabel = listenBtn.querySelector('.listen-label');
    if ('speechSynthesis' in window) {
      var speaking = false;
      var setListenState = function (on) {
        speaking = on;
        listenBtn.classList.toggle('is-speaking', on);
        if (listenLabel) listenLabel.textContent = on ? 'Stop' : 'Listen';
        listenBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      };
      var resetListen = function () { setListenState(false); };
      listenBtn.addEventListener('click', function () {
        var content = document.querySelector('.post-content');
        if (!content) return;
        if (speaking) {
          window.speechSynthesis.cancel();
          resetListen();
          return;
        }
        var utter = new SpeechSynthesisUtterance(content.innerText);
        utter.lang = 'en-IN';
        utter.rate = 1;
        utter.onend = resetListen;
        utter.onerror = resetListen;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
        setListenState(true);
      });
    } else {
      listenBtn.disabled = true;
      listenBtn.title = 'Listening is not supported in this browser';
    }
  }

  /* ---------- Download as PDF (print dialog) ---------- */

  var pdfBtn = document.getElementById('pdf-btn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', function () { window.print(); });
  }

  /* ---------- Also Read: inject cards between sections ---------- */

  var pool = document.getElementById('also-read-pool');
  if (pool) {
    var contentEl = document.querySelector('.post-content');
    var cards = pool.querySelectorAll('.also-read-card');
    if (contentEl && cards.length) {
      var headings = contentEl.querySelectorAll('h2');
      var targets = [];
      [0, 2].forEach(function (idx) {
        if (headings[idx]) targets.push(headings[idx]);
      });
      Array.prototype.forEach.call(cards, function (card, i) {
        var block = document.createElement('div');
        block.className = 'also-read-block';
        block.appendChild(card);
        var target = targets[i];
        if (target) {
          var all = contentEl.querySelectorAll('h2');
          var pos = Array.prototype.indexOf.call(all, target);
          var next = all[pos + 1];
          if (next) {
            next.parentNode.insertBefore(block, next);
          } else {
            contentEl.appendChild(block);
          }
        } else {
          contentEl.appendChild(block);
        }
      });
    }
    pool.parentNode.removeChild(pool);
  }

  /* ---------- Auto table of contents (left sidebar) ---------- */

  var toc = document.getElementById('post-toc');
  var tocContent = document.querySelector('.post-content');
  if (toc && tocContent && !toc.querySelector('.toc-list')) {
    var tocHeadings = tocContent.querySelectorAll('h2, h3');
    if (tocHeadings.length > 1) {
      var tocList = document.createElement('ol');
      tocList.className = 'toc-list';
      var slugCount = {};
      tocHeadings.forEach(function (h) {
        if (!h.id) {
          var base = slugify(h.textContent);
          var slug = base;
          slugCount[base] = (slugCount[base] || 0) + 1;
          if (slugCount[base] > 1) slug = base + '-' + slugCount[base];
          h.id = slug;
        }
        var li = document.createElement('li');
        li.className = 'toc-item toc-' + h.tagName.toLowerCase();
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.dataset.target = h.id;
        li.appendChild(a);
        tocList.appendChild(li);
      });

      var tocTitle = document.createElement('p');
      tocTitle.className = 'toc-title';
      tocTitle.textContent = 'On this page';
      toc.appendChild(tocTitle);
      toc.appendChild(tocList);
      toc.classList.add('has-toc');

      var tocLinks = toc.querySelectorAll('.toc-item a');
      var setActiveToc = function (id) {
        tocLinks.forEach(function (a) {
          a.parentNode.classList.toggle('active', a.dataset.target === id);
        });
      };
      if ('IntersectionObserver' in window) {
        var visible = {};
        var tocIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            visible[entry.target.id] = entry.isIntersecting;
          });
          var current = null;
          tocHeadings.forEach(function (h) {
            if (visible[h.id]) current = h.id;
          });
          if (current) setActiveToc(current);
        }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
        tocHeadings.forEach(function (h) { tocIo.observe(h); });
      }
    } else {
      toc.style.display = 'none';
    }
  }

  /* ---------- Lucide icons ---------- */

  function initIcons() {
    if (window.lucide) {
      lucide.createIcons();
      return true;
    }
    return false;
  }
  if (!initIcons()) {
    window.addEventListener('load', initIcons);
  }

  function slugify(text) {
    return String(text || '').toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
})();
