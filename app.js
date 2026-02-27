/* ========================================
   Isabella Zapparoli — Writing Portfolio
   app.js
   ======================================== */

(function () {
    'use strict';

    // ---- State ----
    let pieces = [];
    let activeFilter = 'All';

    // ---- Color map ----
    const categoryColors = {
        Poetry: '#e6356f',    // magenta
        Opinion: '#f59e42',   // orange
        Essays: '#2dd4bf',    // teal
    };

    // ---- DOM refs ----
    const cardGrid = document.getElementById('cardGrid');
    const noResults = document.getElementById('noResults');
    const readerOverlay = document.getElementById('readerOverlay');
    const readerBackdrop = document.getElementById('readerBackdrop');
    const readerClose = document.getElementById('readerClose');
    const readerContent = document.getElementById('readerContent');
    const filterBar = document.getElementById('filterBar');

    // ---- Load data ----
    async function init() {
        try {
            const resp = await fetch('./content/pieces.json');
            pieces = await resp.json();
            renderCards(pieces);
            setupFilters();
            setupScrollListener();
        } catch (e) {
            console.error('Failed to load pieces:', e);
            cardGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">Unable to load content.</p>';
        }
    }

    // ---- Render cards ----
    function renderCards(items) {
        cardGrid.innerHTML = '';

        if (items.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        items.forEach((piece, i) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.style.setProperty('--card-accent', categoryColors[piece.category] || '#f59e42');
            card.style.animationDelay = `${i * 0.08}s`;

            const tagsHtml = piece.tags.map(t => `<span class="card-tag">${t}</span>`).join('');
            const dateStr = formatDate(piece.date);
            const subtitleHtml = piece.subtitle ? `<p class="card-subtitle">${piece.subtitle}</p>` : '';

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-category">${piece.category}</div>
                    <h2 class="card-title">${piece.title}</h2>
                    ${subtitleHtml}
                    <p class="card-excerpt">${piece.excerpt}</p>
                    <div class="card-meta">
                        <div class="card-tags">${tagsHtml}</div>
                        <span class="card-date">${dateStr}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openReader(piece));
            cardGrid.appendChild(card);
        });
    }

    // ---- Filters ----
    function setupFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                const filtered = activeFilter === 'All'
                    ? pieces
                    : pieces.filter(p => p.category === activeFilter);
                renderCards(filtered);
            });
        });
    }

    // ---- Scroll listener for filter bar shadow ----
    function setupScrollListener() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                filterBar.classList.add('scrolled');
            } else {
                filterBar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ---- Reader overlay ----
    function openReader(piece) {
        const accentColor = categoryColors[piece.category] || '#f59e42';
        const isPoetry = piece.category === 'Poetry';

        let bodyHtml;
        if (isPoetry) {
            // Poetry: preserve exact line breaks with pre-wrap
            bodyHtml = `<div class="reader-body poetry">${escapeHtml(piece.body)}</div>`;
        } else {
            // Prose: split into paragraphs
            const paragraphs = piece.body.split(/\n\n+/).map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
            bodyHtml = `<div class="reader-body prose">${paragraphs}</div>`;
        }

        const subtitleHtml = piece.subtitle
            ? `<p class="reader-subtitle-text">${piece.subtitle}</p>`
            : '';

        const authorHtml = piece.authorCredit
            ? `<p class="reader-author">${piece.authorCredit}</p>`
            : '';

        const submittedHtml = piece.submittedTo
            ? `<p class="reader-submitted">Submitted to ${piece.submittedTo}</p>`
            : '';

        const tagsHtml = piece.tags.map(t => `<span class="reader-tag">${t}</span>`).join('');

        readerContent.innerHTML = `
            <div class="reader-header">
                <div class="reader-category" style="color:${accentColor}">${piece.category}</div>
                <h1 class="reader-title">${piece.title}</h1>
                ${subtitleHtml}
                ${authorHtml}
                ${submittedHtml}
                <div class="reader-tags">${tagsHtml}</div>
            </div>
            ${bodyHtml}
        `;

        readerOverlay.classList.add('open');
        readerOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('reader-open');

        // Scroll panel to top
        document.getElementById('readerPanel').scrollTop = 0;
    }

    function closeReader() {
        readerOverlay.classList.remove('open');
        readerOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('reader-open');
    }

    // Close events
    readerClose.addEventListener('click', closeReader);
    readerBackdrop.addEventListener('click', closeReader);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeReader();
    });

    // ---- Helpers ----
    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- Init ----
    init();
})();
