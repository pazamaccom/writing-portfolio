/* =====================================================
   Isabella Zapparoli — Writing Portfolio
   App Logic: load, country-box filtering, reader overlay
   ===================================================== */

(function () {
  'use strict';

  // --- State ---
  let pieces = [];
  let activeCategory = null; // null = no filter (just About + boxes)

  // --- DOM Refs ---
  const $ = (id) => document.getElementById(id);
  const feedSection    = $('inlineFeed');
  const feedGrid       = $('feedGrid');
  const feedEmpty      = $('feedEmpty');
  const indicator      = $('filterIndicator');
  const indicatorLabel = $('filterLabel');
  const indicatorClear = $('filterClear');
  const readerOverlay  = $('readerOverlay');
  const readerBackdrop = $('readerBackdrop');
  const readerPanel    = $('readerPanel');
  const readerClose    = $('readerClose');
  const readerContent  = $('readerContent');
  const navToggle      = $('navToggle');
  const navLinksEl     = $('navLinks');

  const validCategories = ['Poetry', 'Prose', 'Opinion', 'Essay'];

  // --- Helpers ---
  function escapeHTML(str) {
    if (!str) return '';
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // --- Load Pieces ---
  async function loadPieces() {
    try {
      const res = await fetch('./content/pieces.json');
      pieces = await res.json();
      updateCounts();
    } catch (err) {
      console.error('Failed to load pieces:', err);
    }
  }

  // --- Category counts on the gallery cards ---
  function updateCounts() {
    const counts = { Poetry: 0, Prose: 0, Opinion: 0, Essay: 0 };
    pieces.forEach(p => { if (counts[p.category] !== undefined) counts[p.category]++; });
    document.querySelectorAll('[data-count]').forEach(el => {
      const c = counts[el.dataset.count] || 0;
      el.textContent = c + (c === 1 ? ' piece' : ' pieces');
    });
  }

  // --- Show pieces for a category (inline feed) ---
  function showCategory(cat) {
    if (!validCategories.includes(cat)) return;
    activeCategory = cat;

    // Active states — gallery cards + nav links
    document.querySelectorAll('.gallery-card').forEach(c => {
      c.classList.toggle('active-card', c.dataset.filter === cat);
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.filter === cat);
    });

    // Indicator
    indicator.style.display = 'block';
    indicatorLabel.textContent = cat;

    // Filter + sort (date desc)
    const filtered = pieces.filter(p => p.category === cat);
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render
    feedGrid.innerHTML = '';
    feedEmpty.style.display = sorted.length === 0 ? 'block' : 'none';

    sorted.forEach((piece, i) => {
      const card = document.createElement('article');
      card.className = 'piece-card';
      card.style.animationDelay = (i * 0.06) + 's';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Read: ' + piece.title);

      let tagsHTML = '';
      if (piece.tags && piece.tags.length) {
        const displayTags = piece.tags.slice(0, 3);
        tagsHTML = '<div class="piece-card-tags">' +
          displayTags.map(t => '<span class="piece-card-tag">' + escapeHTML(t) + '</span>').join('') +
          '</div>';
      }
      const subtitleHTML = piece.subtitle
        ? '<p class="piece-card-subtitle">' + escapeHTML(piece.subtitle) + '</p>'
        : '';

      card.innerHTML =
        '<div class="piece-card-header">' +
          '<span class="piece-card-dot piece-card-dot--' + piece.category + '"></span>' +
          '<span class="piece-card-category piece-card-category--' + piece.category + '">' + escapeHTML(piece.category) + '</span>' +
        '</div>' +
        '<h3 class="piece-card-title">' + escapeHTML(piece.title) + '</h3>' +
        subtitleHTML +
        '<p class="piece-card-excerpt">' + escapeHTML(piece.excerpt) + '</p>' +
        '<div class="piece-card-footer">' +
          tagsHTML +
          '<span class="piece-card-date">' + formatDate(piece.date) + '</span>' +
        '</div>';

      card.addEventListener('click', () => openReader(piece));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openReader(piece);
        }
      });

      feedGrid.appendChild(card);
    });

    feedSection.style.display = 'block';

    // Smooth-scroll the indicator into view so the user lands on the filtered feed
    setTimeout(() => indicator.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // --- Clear category and return to the About + boxes view ---
  function clearCategory() {
    activeCategory = null;
    document.querySelectorAll('.gallery-card').forEach(c => c.classList.remove('active-card'));
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.action === 'home');
    });
    indicator.style.display = 'none';
    feedSection.style.display = 'none';
  }

  // --- Reader Overlay ---
  function openReader(piece) {
    let bodyHTML;
    if (piece.category === 'Poetry') {
      bodyHTML = '<div class="reader-body poetry-body">' + escapeHTML(piece.body) + '</div>';
    } else {
      const paragraphs = piece.body.split(/\n\n+/);
      bodyHTML = '<div class="reader-body">' +
        paragraphs.map(p => '<p>' + escapeHTML(p.trim()) + '</p>').join('') +
        '</div>';
    }

    const subtitleHTML  = piece.subtitle    ? '<p class="reader-subtitle">' + escapeHTML(piece.subtitle) + '</p>' : '';
    const authorHTML    = piece.authorCredit? '<p class="reader-author">' + escapeHTML(piece.authorCredit) + '</p>' : '';
    const submittedHTML = piece.submittedTo ? '<p class="reader-submitted">Submitted to <em>' + escapeHTML(piece.submittedTo) + '</em></p>' : '';
    let tagsHTML = '';
    if (piece.tags && piece.tags.length) {
      tagsHTML = '<div class="reader-tags">' +
        piece.tags.map(t => '<span class="reader-tag">' + escapeHTML(t) + '</span>').join('') +
        '</div>';
    }

    readerContent.innerHTML =
      '<div class="reader-meta">' +
        '<span class="reader-cat-dot reader-cat-dot--' + piece.category + '"></span>' +
        '<span class="reader-category reader-category--' + piece.category + '">' + escapeHTML(piece.category) + '</span>' +
        '<span class="reader-date">' + formatDate(piece.date) + '</span>' +
      '</div>' +
      '<h2 class="reader-title">' + escapeHTML(piece.title) + '</h2>' +
      subtitleHTML + authorHTML + submittedHTML +
      '<div class="reader-divider"></div>' +
      bodyHTML +
      tagsHTML;

    readerOverlay.classList.add('open');
    document.body.classList.add('overlay-open');
    readerPanel.scrollTop = 0;
    setTimeout(() => readerClose.focus(), 100);
  }

  function closeReader() {
    readerOverlay.classList.remove('open');
    document.body.classList.remove('overlay-open');
  }

  // --- Hash deep-linking (e.g. #Poetry) ---
  function applyHashFilter() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (validCategories.includes(hash)) {
      showCategory(hash);
    }
  }

  // --- Wire interactions ---

  // Gallery cards (the 4 country boxes)
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = card.dataset.filter;
      if (activeCategory === cat) {
        clearCategory();
      } else {
        showCategory(cat);
      }
      navLinksEl && navLinksEl.classList.remove('open');
    });
  });

  // Nav category links (Poetry / Prose / Opinion / Essays)
  document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showCategory(link.dataset.filter);
      navLinksEl && navLinksEl.classList.remove('open');
    });
  });

  // Brand + Home — return to the About + boxes view
  document.querySelectorAll('[data-action="home"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      clearCategory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navLinksEl && navLinksEl.classList.remove('open');
    });
  });

  // Indicator clear button
  if (indicatorClear) indicatorClear.addEventListener('click', clearCategory);

  // Reader close
  readerClose.addEventListener('click', closeReader);
  readerBackdrop.addEventListener('click', closeReader);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && readerOverlay.classList.contains('open')) {
      closeReader();
    }
  });

  // Mobile nav toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinksEl.classList.toggle('open'));
  }

  // Close mobile nav when clicking outside the top nav
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.top-nav') && navLinksEl) {
      navLinksEl.classList.remove('open');
    }
  });

  // Hash change (browser back/forward)
  window.addEventListener('hashchange', () => {
    if (window.location.hash) {
      applyHashFilter();
    } else {
      clearCategory();
    }
  });

  // --- Init ---
  loadPieces().then(applyHashFilter);
})();
