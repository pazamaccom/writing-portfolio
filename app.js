// === Writing Portfolio — Magazine Feed ===

let pieces = [];
let activeCategory = 'all';

// Load content from JSON
async function loadPieces() {
  try {
    const res = await fetch('./content/pieces.json');
    pieces = await res.json();
    // Sort by date descending
    pieces.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderFeed();
  } catch (err) {
    console.error('Failed to load pieces:', err);
    document.getElementById('feed').innerHTML =
      '<div class="empty-state">Unable to load content.</div>';
  }
}

// Render cards into the feed
function renderFeed() {
  const feed = document.getElementById('feed');
  const filtered = activeCategory === 'all'
    ? pieces
    : pieces.filter(p => p.category === activeCategory);

  if (filtered.length === 0) {
    feed.innerHTML = '<div class="empty-state">No pieces yet in this category.</div>';
    return;
  }

  feed.innerHTML = filtered.map((piece, i) => {
    const excerpt = piece.body.substring(0, 180).replace(/\n/g, ' ') + '...';
    const dateStr = new Date(piece.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const tags = (piece.tags || []).map(t =>
      `<span class="card-tag">${t}</span>`
    ).join('');

    return `
      <article class="card" data-category="${piece.category}" data-id="${piece.id}"
               style="animation-delay: ${i * 0.08}s">
        <div class="card-category">${piece.category}</div>
        <h2 class="card-title">${piece.title}</h2>
        <p class="card-excerpt">${excerpt}</p>
        <div class="card-tags">${tags}</div>
        <div class="card-date">${dateStr}</div>
      </article>
    `;
  }).join('');

  // Attach click handlers
  feed.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      openReader(id);
    });
  });
}

// Open the reader overlay
function openReader(id) {
  const piece = pieces.find(p => p.id === id);
  if (!piece) return;

  document.getElementById('readerCategory').textContent = piece.category;
  document.getElementById('readerTitle').textContent = piece.title;
  document.getElementById('readerDate').textContent =
    new Date(piece.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  document.getElementById('readerBody').textContent = piece.body;

  const overlay = document.getElementById('readerOverlay');
  overlay.classList.add('active');
  overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

// Close reader
function closeReader() {
  document.getElementById('readerOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('readerClose').addEventListener('click', closeReader);
document.getElementById('readerOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeReader();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeReader();
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    renderFeed();
  });
});

// Initialize
loadPieces();
