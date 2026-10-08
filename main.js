import FlipBook from 'flipbook-js';

// Audio Context for realistic procedural page turn sound
let audioCtx = null;
let soundEnabled = true;

function playPageTurnSound() {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const bufferSize = audioCtx.sampleRate * 0.12;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 0.12);
    filter.Q.setValueAtTime(2, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start();
  } catch (err) {
    console.warn('Audio playback not supported:', err);
  }
}

// UI elements
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const indicatorEl = document.getElementById('page-indicator');
const soundBtn = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');

// Sound toggle
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  });
}

function updatePageIndicator(book) {
  const activePages = book.getActivePages();
  const total = book.pages.length;

  if (activePages.length === 1 && activePages[0] === 0) {
    indicatorEl.textContent = 'Cover';
  } else if (activePages.length === 1 && activePages[0] === total - 1) {
    indicatorEl.textContent = 'The End';
  } else if (activePages.length >= 2) {
    indicatorEl.textContent = `Pages ${activePages[0]}-${activePages[1]}`;
  } else if (activePages.length === 1) {
    indicatorEl.textContent = `Page ${activePages[0]}`;
  }

  if (prevBtn) prevBtn.disabled = book.isFirstPage();
  if (nextBtn) nextBtn.disabled = book.isLastPage();
}

// ponytail: patch library bugs in flipbook-js:
// 1. Prevents forward turn overflow past the last page when canClose: true
// 2. Ensures the cover element (r[0]) receives .is-animating when opening so z-index layering is correct
// 3. Guards against multiple concurrent animations during rapid clicks
// 4. Filters transitionend to target element to prevent premature animation termination
FlipBook.prototype.turnPage = function (dir) {
  const { el: t, options: i, classNames: a, Modernizr: o } = this;
  if (!t) return;

  if (t.querySelector(`.${a.page}.${a.isAnimating}`)) return;
  if (dir === 'forward' && this.isLastPage()) return;
  if (dir === 'back' && this.isFirstPage()) return;

  const r = t.querySelectorAll(`.${a.page}.${a.isActive}`);
  const l = t.querySelectorAll(`.${a.page}, .${a.hiddenCover}`);
  const c = this.getActivePages()[0];
  const d = c + 1;
  const isBackAtStart = c === (i.canClose ? 0 : 1) && 'back' === dir;
  const isForwardAtEnd = (d >= (i.canClose ? this.pages.length - 1 : this.pages.length - 2) || this.isLastPage()) && 'forward' === dir;
  if (isBackAtStart || isForwardAtEnd) return;

  let p, v;
  if (typeof dir === 'number') {
    const s = 1 & dir, target = (i.canClose ? s : !s) ? dir : dir + 1, prev = target - 1;
    if (prev === c) return;
    prev > d ? (dir = 'forward', p = prev, v = p + 1) : (dir = 'back', p = target, v = p - 1);
  } else {
    p = 'forward' === dir ? d + 1 : c - 1;
    v = 'forward' === dir ? d + 2 : c - 2;
  }
  if ('forward' === dir && 2 === p) {
    p = 1;
    v = 2;
  }

  const u = 'back' === dir ? r.item(0) : (r.item(1) || r.item(0));
  const f = l.item(p);
  let m = [f];
  if (-1 !== v) {
    m = [...m, l.item(v)];
  }
  const n = [f, u].filter(Boolean);

  r.forEach(e => {
    e.classList.remove(a.isActive);
    e.classList.add(a.wasActive);
  });
  m.forEach(e => {
    e && e.classList.add(a.isActive);
  });
  if (o.csstransforms3d) {
    n.forEach(e => {
      e && e.classList.add(a.isAnimating);
    });
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    n.forEach(e => e && e.classList.remove(a.isAnimating));
    r.forEach(e => e && e.classList.remove(a.wasActive));
  };
  n.forEach(el => {
    const onEnd = (e) => {
      if (e.target !== el || e.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', onEnd);
      cleanup();
    };
    el.addEventListener('transitionend', onEnd);
  });
  setTimeout(cleanup, 950);

  if (i.canClose) {
    const lastEl = m[m.length - 1];
    const isAtEnd = m[0] && m[0].classList.contains(a.lastPage);
    const isAtStart = lastEl && lastEl.classList.contains(a.firstPage);
    if ('back' === dir && isAtStart) {
      t.classList.remove(a.atBackCover);
      t.classList.add(a.atFrontCover);
    } else if ('forward' === dir && isAtEnd) {
      t.classList.remove(a.atFrontCover);
      t.classList.add(a.atBackCover);
    } else {
      t.classList.remove(a.atBackCover);
      t.classList.remove(a.atFrontCover);
    }
  }

  i.onPageTurn(t, { pagesActive: r, children: l });
};

// Initialize FlipBook
const flipbook = new FlipBook('flipbook', {
  nextButton: nextBtn,
  previousButton: prevBtn,
  canClose: true,
  arrowKeys: true,
  initialActivePage: 0,
  width: '100%',
  height: '100%',
  onPageTurn: () => {
    playPageTurnSound();
    setTimeout(() => {
      updatePageIndicator(flipbook);
      syncAllWrappers();
    }, 50);
  }
});

// Update initial indicator state
updatePageIndicator(flipbook);

// Click anywhere to enable AudioContext on first user interaction
window.addEventListener('click', () => {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}, { once: true });

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

window.addEventListener('load', syncAllWrappers);
window.addEventListener('resize', syncAllWrappers);

