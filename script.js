(function () {
  try {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();

document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Smooth scrolling
  document.querySelectorAll('.navbar a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Active section highlighting
  const navLinks = Array.from(document.querySelectorAll(".navbar a"));
  const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const linkById = new Map(navLinks.map(l => [l.getAttribute("href"), l]));
  const setActive = (hash) => {
    navLinks.forEach(l => l.classList.remove("active"));
    const active = linkById.get(hash);
    if (active) active.classList.add("active");
  };
  const io = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible && visible.target.id) setActive("#" + visible.target.id);
  }, { threshold: [0.2, 0.35, 0.55, 0.75] });
  sections.forEach(sec => io.observe(sec));
  setActive("#home");

  // Contact form
  const form = document.getElementById("contactForm");
  const hint = document.getElementById("formHint");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !email || !message) {
        hint.textContent = "Please fill in all fields.";
        return;
      }
      if (!emailOk) {
        hint.textContent = "Please enter a valid email address.";
        return;
      }
      hint.textContent = `Thanks, ${name}! Your message is ready to send.`;
      form.reset();
    });
  }

  // Theme toggle
  const toggle = document.getElementById("themeToggle");
  const flash = document.getElementById("themeFlash");
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  function updateA11y(isDark) {
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
  function setTheme(isDark, { save = true, animate = true } = {}) {
    html.classList.toggle("dark", !!isDark);
    updateA11y(!!isDark);
    if (save) localStorage.setItem("theme", isDark ? "dark" : "light");
    if (animate && toggle) {
      toggle.classList.remove("icon-animate");
      void toggle.offsetWidth;
      toggle.classList.add("icon-animate");
    }
    if (animate && flash) {
      flash.style.background = isDark ? "rgba(96,165,250,0.08)" : "rgba(15,23,42,0.06)";
      flash.classList.remove("flash");
      void flash.offsetWidth;
      flash.classList.add("flash");
    }
  }
  if (toggle) {
    toggle.addEventListener("click", () => {
      const nowDark = !html.classList.contains("dark");
      setTheme(nowDark, { save: true, animate: true });
    });
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle.click();
      }
    });
    if (mq) {
      const handleSystem = (ev) => {
        if (localStorage.getItem("theme")) return;
        setTheme(ev.matches, { save: false, animate: true });
      };
      mq.addEventListener("change", handleSystem);
    }
  }

  // Typewriter
  (function(){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const helloEl = document.querySelector('.typewriter-hello');
    const nameEl = document.querySelector('.typewriter-name');
    if (!helloEl || !nameEl) return;
    const helloText = "HELLO, I'M";
    const nameText = "Jinky Lucero";
    function showFull() {
      helloEl.textContent = helloText;
      nameEl.textContent = nameText;
      helloEl.classList.add('caret');
      nameEl.classList.add('caret');
    }
    if (prefersReduced) {
      showFull();
      return;
    }
    function typeText(el, text, speed = 60) {
      return new Promise(resolve => {
        el.textContent = "";
        el.classList.remove('caret');
        let i = 0;
        function step() {
          if (i < text.length) {
            el.textContent += text.charAt(i++);
            setTimeout(step, speed);
          } else {
            el.classList.add('caret');
            resolve();
          }
        }
        step();
      });
    }
    (async function(){
      await typeText(helloEl, helloText, 70);
      await new Promise(r => setTimeout(r, 350));
      await typeText(nameEl, nameText, 90);
      nameEl.classList.add('caret');
    })();
  })();

  // Image viewer
  (function(){
    const viewer = document.getElementById('imageViewer');
    if (!viewer) return;
    const overlay = viewer.querySelector('.iv-overlay');
    const imgEl = viewer.querySelector('.iv-image');
    const captionEl = viewer.querySelector('.iv-caption');
    const btnPrev = viewer.querySelector('.iv-prev');
    const btnNext = viewer.querySelector('.iv-next');
    const btnClose = viewer.querySelector('.iv-close');
    let items = [];
    let index = 0;
    function openViewer(images, startIndex = 0, title = '') {
      items = images.slice();
      index = Math.max(0, Math.min(startIndex, items.length - 1));
      imgEl.src = items[index];
      imgEl.alt = title || `Project preview ${index+1}`;
      captionEl.textContent = title ? `${title} — ${index+1} / ${items.length}` : `${index+1} / ${items.length}`;
      viewer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      imgEl.focus?.();
    }
    function closeViewer() {
      viewer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      imgEl.src = '';
      items = [];
    }
    function showIndex(i) {
      if (i < 0 || i >= items.length) return;
      index = i;
      imgEl.src = items[index];
      captionEl.textContent = captionEl.textContent.split(' — ')[0] + ` — ${index+1} / ${items.length}`;
    }
    document.querySelectorAll('.card.project').forEach(card => {
      const previewBtn = card.querySelector('.preview-btn');
      const imgs = card.getAttribute('data-images').split(',').map(s => s.trim()).filter(Boolean);
      const title = card.getAttribute('data-title') || card.querySelector('h3')?.textContent || '';
      if (previewBtn) {
        previewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (imgs.length) openViewer(imgs, 0, title);
          else {
            const fallback = card.querySelector('.card-img img')?.src;
            if (fallback) openViewer([fallback], 0, title);
          }
        });
      }
      const imgArea = card.querySelector('.card-img');
      if (imgArea) {
        imgArea.style.cursor = 'pointer';
        imgArea.addEventListener('click', () => {
          if (imgs.length) openViewer(imgs, 0, title);
        });
      }
    });
    btnPrev?.addEventListener('click', () => showIndex(Math.max(0, index - 1)));
    btnNext?.addEventListener('click', () => showIndex(Math.min(items.length - 1, index + 1)));
    btnClose?.addEventListener('click', closeViewer);
    overlay?.addEventListener('click', closeViewer);
    window.addEventListener('keydown', (e) => {
      if (viewer.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeViewer();
        if (e.key === 'ArrowLeft') showIndex(Math.max(0, index - 1));
        if (e.key === 'ArrowRight') showIndex(Math.min(items.length - 1, index + 1));
      }
    });
    let pointer = { active: false, startX: 0, startY: 0 };
    imgEl.addEventListener('pointerdown', (e) => {
      pointer.active = true;
      pointer.startX = e.clientX;
      pointer.startY = e.clientY;
      imgEl.setPointerCapture?.(e.pointerId);
    });
    imgEl.addEventListener('pointerup', (e) => {
      if (!pointer.active) return;
      const dx = e.clientX - pointer.startX;
      const dy = e.clientY - pointer.startY;
      pointer.active = false;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) showIndex(Math.min(items.length - 1, index + 1));
        else showIndex(Math.max(0, index - 1));
      }
    });
  })();

  // Tooltip behavior for .chip (tap to toggle on touch devices, Escape to close)
  (function () {
    const chips = Array.from(document.querySelectorAll('.chip'));
    if (!chips.length) return;

    function clearActive(except) {
      chips.forEach(c => {
        if (c !== except) c.classList.remove('chip--active');
      });
    }

    chips.forEach(chip => {
      // make sure keyboard focus works (tabindex set in HTML)
      chip.addEventListener('click', (e) => {
        // toggle active on click (useful for touch)
        const isActive = chip.classList.toggle('chip--active');
        if (isActive) clearActive(chip);
        else chip.classList.remove('chip--active');
        e.stopPropagation();
      });

      chip.addEventListener('keydown', (e) => {
        // Enter or Space opens/toggles
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          chip.classList.toggle('chip--active');
          clearActive(chip.classList.contains('chip--active') ? chip : null);
        }
      });
    });

    // Click outside closes active tooltip
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.chip')) clearActive();
    });

    // Escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') clearActive();
    });
  })();
});