// Horizontal Strip + Lift Flaps Engine for Sherry's Storybook

const stripContainer = document.getElementById('strip-container');
const cards = Array.from(document.querySelectorAll('.strip-card'));
const pills = Array.from(document.querySelectorAll('.progress-pill'));
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const indicatorEl = document.getElementById('page-indicator');

let currentIndex = 0;
let isProgrammaticScroll = false;
let scrollSettleTimer = null;
let isTouchSwiping = false;
let touchStartX = 0;
let touchStartY = 0;

// Card labels for bottom indicator
const labels = ['Cover', '1: Ed', '2: Leslie', 'The End'];

function updateIndicator(idx) {
  currentIndex = idx;
  if (indicatorEl) {
    indicatorEl.textContent = labels[idx] || `Page ${idx}`;
  }
  if (prevBtn) prevBtn.disabled = idx <= 0;
  if (nextBtn) nextBtn.disabled = idx >= cards.length - 1;

  pills.forEach((pill, i) => {
    pill.classList.toggle('is-active', i === idx);
  });

  cards.forEach((card, i) => {
    card.classList.toggle('is-active', i === idx);
  });
}

// ponytail: mathematically calculates exact scrollLeft to center card without scrollIntoView overshoot
function scrollToIndex(idx) {
  if (idx < 0 || idx >= cards.length) return;
  const targetCard = cards[idx];
  if (!targetCard || !stripContainer) return;

  isProgrammaticScroll = true;
  clearTimeout(scrollSettleTimer);

  const targetLeft = targetCard.offsetLeft - (stripContainer.clientWidth - targetCard.offsetWidth) / 2;
  stripContainer.scrollTo({
    left: Math.round(targetLeft),
    behavior: 'smooth'
  });

  updateIndicator(idx);

  scrollSettleTimer = setTimeout(() => {
    isProgrammaticScroll = false;
  }, 450);
}

// Navigation buttons
prevBtn?.addEventListener('click', () => scrollToIndex(currentIndex - 1));
nextBtn?.addEventListener('click', () => scrollToIndex(currentIndex + 1));

// Progress pill clicks
pills.forEach((pill, idx) => {
  pill.addEventListener('click', () => scrollToIndex(idx));
});

// Keyboard navigation
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') scrollToIndex(currentIndex + 1);
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') scrollToIndex(currentIndex - 1);
});

// Mouse scroll wheel navigation (steps 1 card per wheel notch, prevents page skipping)
let wheelThrottle = false;
window.addEventListener('wheel', (e) => {
  // Allow native trackpad horizontal gesture
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

  if (Math.abs(e.deltaY) < 15) return;
  e.preventDefault();

  if (wheelThrottle) return;
  wheelThrottle = true;
  setTimeout(() => { wheelThrottle = false; }, 320);

  if (e.deltaY > 0) {
    scrollToIndex(currentIndex + 1);
  } else {
    scrollToIndex(currentIndex - 1);
  }
}, { passive: false });

// Calculate closest centered card during manual swipe/scroll
function getCenteredCardIndex() {
  if (!stripContainer) return 0;
  const containerCenter = stripContainer.scrollLeft + stripContainer.clientWidth / 2;
  let closestIdx = 0;
  let minDistance = Infinity;

  cards.forEach((card, i) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const dist = Math.abs(containerCenter - cardCenter);
    if (dist < minDistance) {
      minDistance = dist;
      closestIdx = i;
    }
  });

  return closestIdx;
}

// Real-time scroll listener updates indicator when card centers
stripContainer?.addEventListener('scroll', () => {
  if (isProgrammaticScroll) return;
  const activeIdx = getCenteredCardIndex();
  if (activeIdx !== currentIndex) {
    updateIndicator(activeIdx);
  }
}, { passive: true });

// Touch tracking to distinguish swipe drag from tap
stripContainer?.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isTouchSwiping = false;
}, { passive: true });

stripContainer?.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 1) return;
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (dx > 12 || dy > 12) {
    isTouchSwiping = true;
  }
}, { passive: true });

// Tap navigation on cards: tap right half -> next, left half -> prev, or tap peeking card to center it
cards.forEach((card, idx) => {
  card.addEventListener('click', (e) => {
    if (isTouchSwiping) return;
    if (e.target.closest('.upper-wrapper') || e.target.closest('.lower-art')) return;

    if (idx === currentIndex) {
      const rect = card.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width / 2) {
        scrollToIndex(currentIndex + 1);
      } else {
        scrollToIndex(currentIndex - 1);
      }
    } else {
      scrollToIndex(idx);
    }
  });
});

// Interactive art toggle: upper-wrapper (solid white div) is sized 10px larger than lower-art
// ponytail: ResizeObserver + image load listeners ensure wrapper covers lower-art with exact +10px border
function syncArtWrapper(lower, wrapper) {
  if (!lower || !wrapper) return;
  const w = lower.offsetWidth || lower.naturalWidth;
  const h = lower.offsetHeight || lower.naturalHeight;
  if (w > 0 && h > 0) {
    wrapper.style.width = `${Math.round(w + 10)}px`;
    wrapper.style.height = `${Math.round(h + 10)}px`;
  }
}

function syncAllWrappers() {
  document.querySelectorAll('.cover-art, .page-illustration').forEach((container) => {
    const lower = container.querySelector('.lower-art');
    const wrapper = container.querySelector('.upper-wrapper');
    syncArtWrapper(lower, wrapper);
  });
}

document.querySelectorAll('.cover-art, .page-illustration').forEach((container) => {
  const lower = container.querySelector('.lower-art');
  const wrapper = container.querySelector('.upper-wrapper');
  if (!lower || !wrapper) return;

  // Observe size changes
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => syncArtWrapper(lower, wrapper));
    ro.observe(lower);
  }

  if (lower.complete) {
    syncArtWrapper(lower, wrapper);
  } else {
    lower.addEventListener('load', () => syncArtWrapper(lower, wrapper), { once: true });
  }

  // Click wrapper -> hides whole div (including upper-art), revealing lower-art
  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.add('is-hidden');
  });

  // Click lower-art -> restores whole div (including upper-art)
  lower.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.remove('is-hidden');
  });

  container.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

// Initial boot
updateIndicator(0);
window.addEventListener('load', syncAllWrappers);
window.addEventListener('resize', () => {
  syncAllWrappers();
  scrollToIndex(currentIndex);
});
