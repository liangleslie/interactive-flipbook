// Story Cards Deck Engine — Instagram Stories & 3D Card Stack Format

const cards = Array.from(document.querySelectorAll('.story-card'));
const segments = Array.from(document.querySelectorAll('.progress-segment'));
const chapterPill = document.getElementById('chapter-pill');
const cardCounter = document.getElementById('card-counter');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const tapPrev = document.getElementById('tap-prev');
const tapNext = document.getElementById('tap-next');
const btnReplay = document.getElementById('btn-replay');
const flapBoxes = Array.from(document.querySelectorAll('.flap-box'));

let currentIndex = 0;
const totalCards = cards.length;
const chapterNames = ['Start', '1: Ed', '2: Leslie', 'The End'];

function updateDeckState(targetIndex) {
  if (targetIndex < 0 || targetIndex >= totalCards) return;
  currentIndex = targetIndex;

  // 1. Update card stack classes for 3D depth
  cards.forEach((card, idx) => {
    card.classList.remove('is-active', 'is-next', 'is-next-2', 'is-prev');

    if (idx < currentIndex) {
      card.classList.add('is-prev');
    } else if (idx === currentIndex) {
      card.classList.add('is-active');
    } else if (idx === currentIndex + 1) {
      card.classList.add('is-next');
    } else if (idx === currentIndex + 2) {
      card.classList.add('is-next-2');
    }
  });

  // 2. Update segmented progress bars
  segments.forEach((seg, idx) => {
    seg.classList.toggle('is-viewed', idx < currentIndex);
    seg.classList.toggle('is-active', idx === currentIndex);
  });

  // 3. Update top nav pills
  if (chapterPill) {
    chapterPill.textContent = chapterNames[currentIndex] || `Card ${currentIndex + 1}`;
  }
  if (cardCounter) {
    cardCounter.textContent = `${currentIndex + 1} / ${totalCards}`;
  }

  // 4. Update button states
  if (btnPrev) btnPrev.disabled = currentIndex <= 0;
  if (btnNext) btnNext.disabled = currentIndex >= totalCards - 1;
}

window.goToCard = updateDeckState;

// Navigation Handlers
function nextCard() {
  if (currentIndex < totalCards - 1) {
    updateDeckState(currentIndex + 1);
  }
}

function prevCard() {
  if (currentIndex > 0) {
    updateDeckState(currentIndex - 1);
  }
}

btnPrev?.addEventListener('click', (e) => {
  e.stopPropagation();
  prevCard();
});

btnNext?.addEventListener('click', (e) => {
  e.stopPropagation();
  nextCard();
});

tapPrev?.addEventListener('click', (e) => {
  e.stopPropagation();
  prevCard();
});

tapNext?.addEventListener('click', (e) => {
  e.stopPropagation();
  nextCard();
});

// Click segmented progress bar directly to jump to card
segments.forEach((seg, idx) => {
  seg.addEventListener('click', (e) => {
    e.stopPropagation();
    updateDeckState(idx);
  });
});

// Replay button on final card
btnReplay?.addEventListener('click', (e) => {
  e.stopPropagation();
  // Reset all flaps
  flapBoxes.forEach((box) => {
    const door = box.querySelector('.upper-door');
    if (door && box.getAttribute('data-card') !== '3') {
      door.classList.remove('is-lifted');
    }
    box.classList.remove('is-revealed');
  });
  updateDeckState(0);
});

// 3D Tactile Flap Lift Interaction
flapBoxes.forEach((box) => {
  box.addEventListener('click', (e) => {
    e.stopPropagation();
    const door = box.querySelector('.upper-door');
    if (!door) return;

    const isLifted = door.classList.toggle('is-lifted');
    box.classList.toggle('is-revealed', isLifted);
  });
});

// Touch Swipe Gestures
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (e.changedTouches.length === 0) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  const timeDiff = Date.now() - touchStartTime;

  // Check horizontal swipe
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40 && timeDiff < 600) {
    if (diffX < 0) {
      nextCard();
    } else {
      prevCard();
    }
  }
}, { passive: true });

// Keyboard Navigation
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    nextCard();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    prevCard();
  }
});

// Initial boot
updateDeckState(0);
