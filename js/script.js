// TERA.OR.ID — Homepage interactions
// Scroll reveal (hero lines) + count-up (stats), vanilla JS only.

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCountUp();
  initHeader();
  initFooterYear();
});

function initHeader() {
  const header = document.getElementById('site-header');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navGroup = document.getElementById('nav-group');
  const navGroupBtn = document.getElementById('nav-group-btn');

  if (header && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-mobile-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (navGroup && navGroupBtn) {
    navGroupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navGroup.classList.toggle('is-open');
      navGroupBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!navGroup.contains(e.target)) {
        navGroup.classList.remove('is-open');
        navGroupBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

function initScrollReveal() {
  const lines = document.querySelectorAll('.hero-line');
  if (!lines.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  lines.forEach((line) => observer.observe(line));
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
