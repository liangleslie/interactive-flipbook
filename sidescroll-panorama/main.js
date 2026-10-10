// Continuous Panorama Engine with Scroll-Driven Stationary Pin & Morph Engine

const viewport = document.getElementById('panorama-viewport');
const scenes = Array.from(document.querySelectorAll('.scene-station'));
const landmarkNodes = Array.from(document.querySelectorAll('.landmark-node'));
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const chapterLabel = document.getElementById('chapter-label');
const journeyProgress = document.getElementById('journey-progress');
const morphTargets = Array.from(document.querySelectorAll('.character-morph-target'));

let currentSceneIndex = 0;
const sceneNames = ['Start', '1: Ed', '2: Leslie', 'The End'];

// Pronounced scroll-pin budget for each character station (in pixels of scroll delta)
const D_PRE = 260;    // Phase 1: Pronounced pre-morph linger at center (stationary, upper-art registered)
const D_MORPH = 320;  // Phase 2: Gradual deliberate morph while stationary at center (upper-art -> lower-art)
const D_POST = 260;   // Phase 3: Pronounced post-morph linger at center (stationary, lower-art registered)
const D_TOTAL = D_PRE + D_MORPH + D_POST; // 840px total stationary window

function updateSceneUI(idx) {
  currentSceneIndex = idx;
  if (chapterLabel) {
    chapterLabel.textContent = sceneNames[idx] || `Scene ${idx + 1}`;
  }
  if (prevBtn) prevBtn.disabled = idx <= 0;
  if (nextBtn) nextBtn.disabled = idx >= scenes.length - 1;

  landmarkNodes.forEach((node, i) => {
    node.classList.toggle('is-active', i === idx);
  });
}

function getSceneCenterScroll(idx) {
  if (!viewport || !scenes[idx]) return 0;
  if (idx === 0) return 0;
  const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  if (idx === scenes.length - 1) {
    return maxScroll;
  }
  const scene = scenes[idx];
  const natural = Math.round(scene.offsetLeft - (viewport.clientWidth - scene.offsetWidth) / 2);
  return Math.min(natural, maxScroll);
}
window.getSceneCenterScroll = getSceneCenterScroll;

// ponytail: calculates active chapter index with clamp linger windows and travel midpoints
function getActiveSceneIndex(S) {
  const S0 = getSceneCenterScroll(0);
  const S1 = getSceneCenterScroll(1);
  const S2 = getSceneCenterScroll(2);
  const S3 = getSceneCenterScroll(3);

  const T01 = (S0 + D_TOTAL + S1) / 2;
  const T12 = (S1 + D_TOTAL + S2) / 2;
  const T23 = (S2 + D_TOTAL + S3) / 2;

  if (S < T01) return 0;
  if (S < T12) return 1;
  if (S < T23) return 2;
  return 3;
}
window.getActiveSceneIndex = getActiveSceneIndex;

// Center specific scene smoothly
function scrollToScene(idx) {
  if (idx < 0 || idx >= scenes.length) return;
  if (!viewport) return;

  const targetS = getSceneCenterScroll(idx);
  viewport.scrollTo({
    left: targetS,
    behavior: 'smooth'
  });

  updateSceneUI(idx);
}
window.scrollToScene = scrollToScene;

// Navigation buttons
prevBtn?.addEventListener('click', () => scrollToScene(currentSceneIndex - 1));
nextBtn?.addEventListener('click', () => scrollToScene(currentSceneIndex + 1));

// Landmark nodes (journey progress dots)
landmarkNodes.forEach((node, idx) => {
  node.addEventListener('click', () => scrollToScene(idx));
});

// Keyboard arrows
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') scrollToScene(currentSceneIndex + 1);
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') scrollToScene(currentSceneIndex - 1);
});

// ponytail: smooth velvety resistance during the stationary pin & morph window
function getCenterFriction() {
  const S = viewport.scrollLeft;
  for (let i = 0; i < 3; i++) {
    const sc = getSceneCenterScroll(i);
    const delta = S - sc;
    if (delta >= 0 && delta <= D_TOTAL) {
      return 0.85; // smooth gliding through the stationary morph
    }
  }
  return 1.05;
}

// Continuous mouse wheel horizontal gliding with subconscious morph resistance
window.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  if (Math.abs(e.deltaY) < 4) return;
  e.preventDefault();

  const friction = getCenterFriction();
  viewport.scrollLeft += e.deltaY * friction;
}, { passive: false });

// ponytail: computes accumulated background counter-shift so scenery stays 100% stationary during clamping
function getBackgroundShift(S) {
  let shift = 0;
  for (let i = 0; i < 3; i++) {
    const S_center = getSceneCenterScroll(i);
    const delta = S - S_center;
    if (delta <= 0) {
      break;
    } else if (delta < D_TOTAL) {
      shift += delta;
      break;
    } else {
      shift += D_TOTAL;
    }
  }
  return shift;
}
window.getBackgroundShift = getBackgroundShift;

// ponytail: 4-phase scroll pin & morph engine:
// 1. Pre-morph linger at center: stationary, upper-art stays so image registers
// 2. Gradual morph: stationary at center, image cross-dissolves as user scrolls
// 3. Post-morph linger: stationary at center, fully morphed image lingers
// 4. Release: resumes horizontal motion off to the left
function updateScrollDrivenMorphs() {
  if (!viewport) return;
  const S = viewport.scrollLeft;

  // Counter-translate background and scenery so world stays 100% stationary during clamping
  const bgShift = getBackgroundShift(S);
  const visualBgX = Math.round(bgShift - S);

  const backdrop = document.querySelector('.panorama-backdrop-layer');
  if (backdrop) {
    backdrop.style.backgroundPositionX = `${visualBgX}px`;
  }
  const spriteLayer = document.querySelector('.sprite-track-layer');
  if (spriteLayer) {
    spriteLayer.style.transform = `translateX(${visualBgX}px)`;
  }

  scenes.forEach((scene, i) => {
    const flow = scene.querySelector('.station-flow');
    const morphTarget = scene.querySelector('.character-morph-target');
    const upper = scene.querySelector('.character-morph-target .upper-art');
    const lower = scene.querySelector('.character-morph-target .lower-art');

    if (i >= 3) {
      // Scene 3 (The End): no character morph, natural arrival
      if (flow) flow.style.transform = 'none';
      return;
    }

    const S_center = getSceneCenterScroll(i);
    const delta = S - S_center;

    let shift = 0;
    let morphProgress = 0;
    let phase = '';

    if (delta < 0) {
      // Approaching center from the right: natural motion, pre-morph state
      shift = 0;
      morphProgress = 0;
    } else if (delta < D_PRE) {
      // Phase 1: Station is at center -> stays stationary for pre-morph linger
      shift = delta;
      morphProgress = 0;
      phase = 'pre-linger';
    } else if (delta < D_PRE + D_MORPH) {
      // Phase 2: Still stationary at center -> image gradually morphs as user scrolls
      shift = delta;
      const raw = (delta - D_PRE) / D_MORPH;
      morphProgress = Math.sin((raw * Math.PI) / 2);
      phase = 'morphing';
    } else if (delta < D_TOTAL) {
      // Phase 3: Still stationary at center -> post-morph linger so revealed image registers
      shift = delta;
      morphProgress = 1;
      phase = 'post-linger';
    } else {
      // Phase 4: Released! Resumes moving horizontally to the left
      shift = D_TOTAL;
      morphProgress = 1;
    }

    if (morphTarget) {
      if (phase) morphTarget.setAttribute('data-phase', phase);
      else morphTarget.removeAttribute('data-phase');
    }

    // Counter-translate station flow so it visually stays at 50vw center during pin window
    if (flow) {
      flow.style.transform = `translateX(${Math.round(shift)}px)`;
    }

    // Morph opacity and subtle scale
    if (upper && lower && !morphTarget?.classList.contains('is-pinned')) {
      upper.style.opacity = (1 - morphProgress).toFixed(3);
      upper.style.transform = `translate(-50%, -50%) scale(${(1 + 0.05 * morphProgress).toFixed(3)})`;

      lower.style.opacity = morphProgress.toFixed(3);
      lower.style.transform = `translate(-50%, -50%) scale(${(0.95 + 0.05 * morphProgress).toFixed(3)})`;
    }
  });
}
window.updateScrollDrivenMorphs = updateScrollDrivenMorphs;

// Tap on character morph target -> pins morph state (toggles upper <-> lower)
morphTargets.forEach((target) => {
  target.addEventListener('click', (e) => {
    e.stopPropagation();
    const isPinned = target.classList.toggle('is-pinned');
    const upper = target.querySelector('.upper-art');
    const lower = target.querySelector('.lower-art');
    if (!upper || !lower) return;

    if (isPinned) {
      upper.style.opacity = '0';
      upper.style.transform = 'translate(-50%, -50%) scale(1.05)';
      lower.style.opacity = '1';
      lower.style.transform = 'translate(-50%, -50%) scale(1)';
    } else {
      updateScrollDrivenMorphs();
    }
  });
});

// Real-time scroll handler: updates journey progress bar, closest scene label, and character morphs
let ticking = false;

function handleScroll() {
  if (!viewport) return;

  // 1. Update journey progress bar %
  const maxScroll = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
  if (journeyProgress) {
    const pct = (viewport.scrollLeft / maxScroll) * 100;
    journeyProgress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  // 2. Identify active scene using clamp-aware interval logic
  const S = viewport.scrollLeft;
  const activeIdx = getActiveSceneIndex(S);

  if (activeIdx !== currentSceneIndex) {
    updateSceneUI(activeIdx);
  }

  // 3. Scroll-driven character stationary pin & morph update
  updateScrollDrivenMorphs();
}
window.handleScroll = handleScroll;

viewport?.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// Initial boot: start with cover centered at scrollLeft = 0
if (viewport) viewport.scrollLeft = 0;
updateSceneUI(0);
handleScroll();
updateScrollDrivenMorphs();

window.addEventListener('load', () => {
  if (viewport) viewport.scrollLeft = 0;
  handleScroll();
  updateScrollDrivenMorphs();
});

window.addEventListener('resize', () => {
  handleScroll();
  updateScrollDrivenMorphs();
});
