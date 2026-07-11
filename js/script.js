// TERA.OR.ID — Homepage interactions
// Scroll reveal (hero lines) + count-up (stats), vanilla JS only.

document.addEventListener('DOMContentLoaded', () => {
  initHeroSequence();
  initCountUp();
  initHeroDeconflict();
});

// Hides any decorative hero photo/emoji that overlaps the headline text —
// on small screens the (fixed-px) decorative elements take up proportionally
// more space and can start covering the words, so we just drop whichever
// ones collide instead of trying to hand-tune breakpoints per element.
function initHeroDeconflict() {
  const heroMain = document.querySelector('.hero-main');
  const targets = document.querySelectorAll('.hero-photo, .hero-emoji');
  if (!heroMain || !targets.length) return;

  function overlaps(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function check() {
    const textRect = heroMain.getBoundingClientRect();
    targets.forEach((el) => {
      // display:none (not opacity via class) because the entrance animation's
      // fill-mode keeps holding the opacity/transform properties even after
      // it finishes, so a plain CSS opacity override never wins against it.
      const hide = overlaps(el.getBoundingClientRect(), textRect);
      el.style.display = hide ? 'none' : '';
    });
  }

  // wait for the entrance animations to settle so getBoundingClientRect
  // reflects each element's resting position, not its mid-animation scale.
  setTimeout(check, 1700);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(check, 150);
  });
}

// Pinned hero card sequence: paints a gradient placeholder behind each
// video (fallback while the video loads / if it's blocked), then maps
// native page-scroll progress through #heroPin to the active card index.
function initHeroSequence() {
  const TONES = {
    a: ['#2e6fe0', '#0d6efd', '#0b57d0'],
    b: ['#e0a83f', '#d9a441', '#a97620'],
    c: ['#7fa8f5', '#5b8def', '#0b57d0'],
    d: ['#d9a441', '#3f7de0', '#0a1730']
  };

  function paintPhoto(canvas, stops) {
    const parent = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const grad = ctx.createLinearGradient(0, 0, w * 0.3, h);
    grad.addColorStop(0, stops[0]);
    grad.addColorStop(0.55, stops[1]);
    grad.addColorStop(1, stops[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    [
      { x: w * 0.78, y: h * 0.22, r: Math.max(w, h) * 0.42, c: 'rgba(255,255,255,0.16)' },
      { x: w * 0.18, y: h * 0.75, r: Math.max(w, h) * 0.36, c: 'rgba(10,23,48,0.28)' }
    ].forEach((blob) => {
      const g = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
      g.addColorStop(0, blob.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  const cardEls = Array.from(document.querySelectorAll('#heroStrip .hero-card'));

  function paintAll() {
    cardEls.forEach((card) => {
      const canvas = card.querySelector('.hero-card-photo');
      const tone = TONES[card.dataset.tone];
      if (canvas && tone) paintPhoto(canvas, tone);
    });
  }

  paintAll();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(paintAll, 150);
  });

  const pin = document.getElementById('heroPin');
  const strip = document.getElementById('heroStrip');
  const hint = document.getElementById('heroHint');
  const dots = Array.from(document.querySelectorAll('#heroDots .hero-dot'));
  if (!pin || !strip || !cardEls.length) return;

  const n = cardEls.length;
  let lastIndex = -1;
  let lastFull = null;

  function update() {
    const rect = pin.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    let progress = travel > 0 ? (-rect.top) / travel : 0;
    progress = Math.max(0, Math.min(1, progress));

    // grow to full-screen only mid-run; boxed at the very start/end
    const full = progress > 0.05 && progress < 0.93;
    if (full !== lastFull) {
      lastFull = full;
      pin.classList.toggle('is-full', full);
    }

    // even thirds: each card owns one third of the scroll
    const idx = Math.min(n - 1, Math.floor(progress * n));
    if (idx === lastIndex) return;
    lastIndex = idx;

    strip.style.setProperty('--active', idx);
    cardEls.forEach((card, i) => card.classList.toggle('is-current', i === idx));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
    if (hint) hint.classList.toggle('is-hidden', idx === n - 1);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }, { passive: true });

  update();
  window.addEventListener('resize', update);
}

function initCountUp() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const duration = 1500;

  const animate = (el) => {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}
