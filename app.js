/* =====================================================
   Isabella Zapparoli — Writing Portfolio
   App Logic: Load, Filter, Reader
   ===================================================== */

(function () {
  'use strict';

  // --- State ---
  let pieces = [];
  let activeFilter = 'all';

  // --- DOM Refs ---
  const feedGrid       = document.getElementById('feedGrid');
  const feedEmpty       = document.getElementById('feedEmpty');
  const readerOverlay   = document.getElementById('readerOverlay');
  const readerBackdrop  = document.getElementById('readerBackdrop');
  const readerPanel     = document.getElementById('readerPanel');
  const readerClose     = document.getElementById('readerClose');
  const readerContent   = document.getElementById('readerContent');
  const filterIndicator = document.getElementById('filterIndicator');
  const filterLabel     = document.getElementById('filterLabel');
  const filterClear     = document.getElementById('filterClear');
  const navToggle       = document.getElementById('navToggle');
  const navLinksEl      = document.getElementById('navLinks');
  const countPoetry     = document.getElementById('countPoetry');
  const countOpinion    = document.getElementById('countOpinion');
  const countProse      = document.getElementById('countProse');

  // --- Load Pieces ---
  async function loadPieces() {
    try {
      const res = await fetch('./content/pieces.json');
      pieces = await res.json();
      updateCounts();
      renderFeed();
    } catch (err) {
      console.error('Failed to load pieces:', err);
      feedGrid.innerHTML = '<p style="text-align:center;color:#8a7868;padding:40px;">Unable to load content.</p>';
    }
  }

  // --- Update category counts ---
  function updateCounts() {
    const counts = { Poetry: 0, Opinion: 0, Prose: 0 };
    pieces.forEach(p => {
      if (counts[p.category] !== undefined) counts[p.category]++;
    });
    countPoetry.textContent = counts.Poetry + (counts.Poetry === 1 ? ' piece' : ' pieces');
    countOpinion.textContent = counts.Opinion + (counts.Opinion === 1 ? ' piece' : ' pieces');
    countProse.textContent = counts.Prose + (counts.Prose === 1 ? ' piece' : ' pieces');
  }

  // --- Format date ---
  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // --- Render Feed ---
  function renderFeed() {
    const filtered = activeFilter === 'all'
      ? pieces
      : pieces.filter(p => p.category === activeFilter);

    feedGrid.innerHTML = '';
    feedEmpty.style.display = filtered.length === 0 ? 'block' : 'none';

    // Sort by date descending
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach((piece, i) => {
      const card = document.createElement('article');
      card.className = 'piece-card';
      card.style.animationDelay = (i * 0.06) + 's';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Read: ' + piece.title);

      let tagsHTML = '';
      if (piece.tags && piece.tags.length) {
        tagsHTML = '<div class="piece-card-tags">' +
          piece.tags.map(t => '<span class="piece-card-tag">' + escapeHTML(t) + '</span>').join('') +
          '</div>';
      }

      let subtitleHTML = '';
      if (piece.subtitle) {
        subtitleHTML = '<p class="piece-card-subtitle">' + escapeHTML(piece.subtitle) + '</p>';
      }

      card.innerHTML = `
        <div class="piece-card-header">
          <span class="piece-card-dot piece-card-dot--${piece.category}"></span>
          <span class="piece-card-category piece-card-category--${piece.category}">${escapeHTML(piece.category)}</span>
        </div>
        <h3 class="piece-card-title">${escapeHTML(piece.title)}</h3>
        ${subtitleHTML}
        <p class="piece-card-excerpt">${escapeHTML(piece.excerpt)}</p>
        <div class="piece-card-footer">
          ${tagsHTML}
          <span class="piece-card-date">${formatDate(piece.date)}</span>
        </div>
      `;

      card.addEventListener('click', () => openReader(piece));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openReader(piece);
        }
      });

      feedGrid.appendChild(card);
    });

    // Update filter indicator
    if (activeFilter === 'all') {
      filterIndicator.style.display = 'none';
    } else {
      filterIndicator.style.display = 'block';
      filterLabel.textContent = activeFilter;
    }
  }

  // --- Set Active Filter ---
  function setFilter(cat) {
    activeFilter = cat;

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.filter === cat);
    });

    // Update category cards
    document.querySelectorAll('.cat-card').forEach(card => {
      card.classList.toggle('active-cat', card.dataset.filter === cat);
    });

    renderFeed();

    // Close mobile nav if open
    navLinksEl.classList.remove('open');
  }

  // --- Open Reader ---
  function openReader(piece) {
    let bodyHTML = '';
    if (piece.category === 'Poetry') {
      bodyHTML = '<div class="reader-body poetry-body">' + escapeHTML(piece.body) + '</div>';
    } else {
      // Split on double newlines for prose/opinion
      const paragraphs = piece.body.split(/\n\n+/);
      bodyHTML = '<div class="reader-body">' +
        paragraphs.map(p => '<p>' + escapeHTML(p.trim()) + '</p>').join('') +
        '</div>';
    }

    let subtitleHTML = '';
    if (piece.subtitle) {
      subtitleHTML = '<p class="reader-subtitle">' + escapeHTML(piece.subtitle) + '</p>';
    }

    let authorHTML = '';
    if (piece.authorCredit) {
      authorHTML = '<p class="reader-author">' + escapeHTML(piece.authorCredit) + '</p>';
    }

    let submittedHTML = '';
    if (piece.submittedTo) {
      submittedHTML = '<p class="reader-submitted">Submitted to <em>' + escapeHTML(piece.submittedTo) + '</em></p>';
    }

    let tagsHTML = '';
    if (piece.tags && piece.tags.length) {
      tagsHTML = '<div class="reader-tags">' +
        piece.tags.map(t => '<span class="reader-tag">' + escapeHTML(t) + '</span>').join('') +
        '</div>';
    }

    readerContent.innerHTML = `
      <div class="reader-meta">
        <span class="reader-cat-dot reader-cat-dot--${piece.category}"></span>
        <span class="reader-category reader-category--${piece.category}">${escapeHTML(piece.category)}</span>
        <span class="reader-date">${formatDate(piece.date)}</span>
      </div>
      <h2 class="reader-title">${escapeHTML(piece.title)}</h2>
      ${subtitleHTML}
      ${authorHTML}
      ${submittedHTML}
      <div class="reader-divider"></div>
      ${bodyHTML}
      ${tagsHTML}
    `;

    readerOverlay.classList.add('open');
    document.body.classList.add('overlay-open');
    readerPanel.scrollTop = 0;

    // Focus the close button for accessibility
    setTimeout(() => readerClose.focus(), 100);
  }

  // --- Close Reader ---
  function closeReader() {
    readerOverlay.classList.remove('open');
    document.body.classList.remove('overlay-open');
  }

  // --- Escape HTML ---
  function escapeHTML(str) {
    if (!str) return '';
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // --- Event Listeners ---

  // Nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setFilter(link.dataset.filter);
    });
  });

  // Nav brand (go home)
  document.querySelector('.nav-brand').addEventListener('click', (e) => {
    e.preventDefault();
    setFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Category cards
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.filter;
      // If already active, toggle off (go back to all)
      if (activeFilter === cat) {
        setFilter('all');
      } else {
        setFilter(cat);
      }
    });
  });

  // Filter clear
  filterClear.addEventListener('click', () => setFilter('all'));

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
  navToggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.top-nav')) {
      navLinksEl.classList.remove('open');
    }
  });

  // --- Init ---
  loadPieces();
})();
