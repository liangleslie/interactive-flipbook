// Vertical Storyboard Snap Feed Engine

const viewport = document.getElementById('feed-viewport');
const sections = Array.from(document.querySelectorAll('.feed-section'));
const trackerNodes = Array.from(document.querySelectorAll('.tracker-node'));
const chapterPill = document.getElementById('chapter-pill');
const feedCounter = document.getElementById('feed-counter');
const btnPrev = document.getElementById('btn-prev-section');
const btnNext = document.getElementById('btn-next-section');
const btnRestart = document.getElementById('btn-restart');
const flapBoxes = Array.from(document.querySelectorAll('.flap-box'));

let currentSectionIndex = 0;
const totalSections = sections.length;
const chapterNames = ['Start', '1: Ed', '2: Leslie', 'The End'];

function updateActiveSection(idx) {
  if (idx < 0 || idx >= totalSections) return;
  currentSectionIndex = idx;

  // 1. Header chapter title pill
  if (chapterPill) {
    chapterPill.textContent = chapterNames[idx] || `Section ${idx + 1}`;
  }

  // 2. Bottom counter
  if (feedCounter) {
    feedCounter.textContent = `${idx + 1} / ${totalSections}`;
  }

  // 3. Right tracker dots
  trackerNodes.forEach((node, i) => {
    node.classList.toggle('is-active', i === idx);
  });

  // 4. Navigation buttons
  if (btnPrev) btnPrev.disabled = idx <= 0;
  if (btnNext) btnNext.disabled = idx >= totalSections - 1;
}

function scrollToSection(idx) {
  if (!viewport || idx < 0 || idx >= totalSections) return;
  const targetTop = idx * viewport.clientHeight;
  viewport.scrollTo({
    top: targetTop,
    behavior: 'smooth'
  });
  updateActiveSection(idx);
}

window.scrollToSection = scrollToSection;

// Navigation Buttons
btnPrev?.addEventListener('click', () => scrollToSection(currentSectionIndex - 1));
btnNext?.addEventListener('click', () => scrollToSection(currentSectionIndex + 1));
btnRestart?.addEventListener('click', () => {
  // Reset all flaps
  flapBoxes.forEach((box) => {
    const flap = box.querySelector('.upper-flap');
    if (flap && box.getAttribute('data-section') !== '3') {
      flap.classList.remove('is-lifted');
    }
    box.classList.remove('is-revealed');
  });
  scrollToSection(0);
});

// Tracker dot clicks
trackerNodes.forEach((node, idx) => {
  node.addEventListener('click', () => scrollToSection(idx));
});

// Scroll Detection using rAF
let ticking = false;

function onScroll() {
  if (!viewport) return;
  const itemHeight = viewport.clientHeight;
  if (itemHeight <= 0) return;

  const scrollMiddle = viewport.scrollTop + itemHeight / 2;
  const closestIdx = Math.min(totalSections - 1, Math.max(0, Math.floor(scrollMiddle / itemHeight)));

  if (closestIdx !== currentSectionIndex) {
    updateActiveSection(closestIdx);
  }
}

viewport?.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// 3D Tactile Flap Lift Interaction
flapBoxes.forEach((box) => {
  box.addEventListener('click', (e) => {
    e.stopPropagation();
    const flap = box.querySelector('.upper-flap');
    if (!flap) return;

    const isLifted = flap.classList.toggle('is-lifted');
    box.classList.toggle('is-revealed', isLifted);
  });
});

// Keyboard Navigation
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    scrollToSection(currentSectionIndex + 1);
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    scrollToSection(currentSectionIndex - 1);
  }
});

// Initial boot
updateActiveSection(0);
