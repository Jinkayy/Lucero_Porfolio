document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Smooth scrolling is already handled by CSS scroll-behavior,
  // but we also prevent jump for older browsers.
  document.querySelectorAll('.navbar a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Active section highlighting using IntersectionObserver (efficient + smooth).
  const navLinks = Array.from(document.querySelectorAll(".navbar a"));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const linkById = new Map(
    navLinks.map(l => [l.getAttribute("href"), l])
  );

  const setActive = (hash) => {
    navLinks.forEach(l => l.classList.remove("active"));
    const active = linkById.get(hash);
    if (active) active.classList.add("active");
  };

  const io = new IntersectionObserver((entries) => {
    // pick the most visible section
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible && visible.target && visible.target.id) {
      setActive("#" + visible.target.id);
    }
  }, { threshold: [0.2, 0.35, 0.55, 0.75] });

  sections.forEach(sec => io.observe(sec));
  setActive("#home");

  // Contact form (simple validation + accessible hint)
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
        if (hint) hint.textContent = "Please fill in all fields.";
        return;
      }
      if (!emailOk) {
        if (hint) hint.textContent = "Please enter a valid email address.";
        return;
      }

      if (hint) hint.textContent = `Thanks, ${name}! Your message is ready to send.`;
      form.reset();
    });
  }

  // Theme toggle
  const toggle = document.getElementById("themeToggle");
  const flash = document.getElementById("themeFlash");
  const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

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
      flash.style.background = isDark
        ? "rgba(96,165,250,0.08)"
        : "rgba(15,23,42,0.06)";
      flash.classList.remove("flash");
      void flash.offsetWidth;
      flash.classList.add("flash");
    }
  }

  // Init theme without animation (to avoid motion on load)
  if (toggle) {
    const saved = localStorage.getItem("theme");
    const prefersDark = mq ? mq.matches : false;
    const initialDark = saved ? saved === "dark" : prefersDark;

    setTheme(initialDark, { save: false, animate: false });

    toggle.addEventListener("click", () => {
      const nowDark = !html.classList.contains("dark");
      setTheme(nowDark, { save: true, animate: true });
    });

    // Keyboard support (Space / Enter)
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle.click();
      }
    });

    // If user has NOT chosen a theme, follow system changes.
    if (mq) {
      const handleSystem = (ev) => {
        if (localStorage.getItem("theme")) return;
        setTheme(ev.matches, { save: false, animate: true });
      };
      if (typeof mq.addEventListener === "function") mq.addEventListener("change", handleSystem);
      else if (typeof mq.addListener === "function") mq.addListener(handleSystem);
    }
  }

  // Typewriter for hero: "HELLO, I'M" then "Jinky Lucero"
  (function(){
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const helloEl = document.querySelector('.typewriter-hello');
    const nameEl = document.querySelector('.typewriter-name');

    if(!helloEl || !nameEl) return;

    const helloText = "HELLO, I'M";
    const nameText = "Jinky Lucero";

    function showFull() {
      helloEl.textContent = helloText;
      nameEl.textContent = nameText;
      helloEl.classList.add('caret');
      nameEl.classList.add('caret');
    }

    if(prefersReduced){
      showFull();
      return;
    }

    // typing helper
    function typeText(el, text, speed = 60){
      return new Promise(resolve => {
        el.textContent = "";
        el.classList.remove('caret');
        let i = 0;
        function step(){
          if(i < text.length){
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

    // sequence: type hello, pause, type name
    (async function(){
      await typeText(helloEl, helloText, 70);
      await new Promise(r => setTimeout(r, 350));
      await typeText(nameEl, nameText, 90);
      // leave caret on the name for clarity
      nameEl.classList.add('caret');
    })();
  })();

  // Project image viewer implementation
  (function(){
    const viewer = document.getElementById('imageViewer');
    if(!viewer) return;
    const overlay = viewer.querySelector('.iv-overlay');
    const panel = viewer.querySelector('.iv-panel');
    const imgEl = viewer.querySelector('.iv-image');
    const captionEl = viewer.querySelector('.iv-caption');
    const btnPrev = viewer.querySelector('.iv-prev');
    const btnNext = viewer.querySelector('.iv-next');
    const btnClose = viewer.querySelector('.iv-close');

    let items = []; // current project's images
    let index = 0;

    function openViewer(images, startIndex = 0, title = '') {
      items = images.slice();
      index = Math.max(0, Math.min(startIndex, items.length - 1));
      imgEl.src = items[index];
      imgEl.alt = title || `Project preview ${index+1}`;
      captionEl.textContent = title ? `${title} — ${index+1} / ${items.length}` : `${index+1} / ${items.length}`;
      viewer.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      imgEl.focus?.();
    }

    function closeViewer(){
      viewer.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
      imgEl.src = '';
      items = [];
    }

    function showIndex(i){
      if(i < 0 || i >= items.length) return;
      index = i;
      imgEl.src = items[index];
      captionEl.textContent = captionEl.textContent.split(' — ')[0] + ` — ${index+1} / ${items.length}`;
    }

    // Wire up project preview buttons
    document.querySelectorAll('.card.project').forEach(card => {
      const previewBtn = card.querySelector('.preview-btn');
      const data = card.getAttribute('data-images') || '';
      const imgs = data.split(',').map(s => s.trim()).filter(Boolean);
      const title = card.getAttribute('data-title') || card.querySelector('h3')?.textContent || '';
      if(previewBtn){
        previewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if(imgs.length) openViewer(imgs, 0, title);
          else {
            // fallback: show main card image
            const fallback = card.querySelector('.card-img img')?.src;
            if(fallback) openViewer([fallback], 0, title);
          }
        });
      }
      // allow clicking the image area to open preview
      const imgArea = card.querySelector('.card-img');
      if(imgArea){
        imgArea.style.cursor = 'pointer';
        imgArea.addEventListener('click', () => {
          if(imgs.length) openViewer(imgs,0,title);
        });
      }
    });

    // Controls
    btnPrev?.addEventListener('click', () => showIndex(Math.max(0,index-1)));
    btnNext?.addEventListener('click', () => showIndex(Math.min(items.length-1,index+1)));
    btnClose?.addEventListener('click', closeViewer);
    overlay?.addEventListener('click', closeViewer);

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if(viewer.getAttribute('aria-hidden') === 'false') {
        if(e.key === 'Escape') closeViewer();
        if(e.key === 'ArrowLeft') showIndex(Math.max(0,index-1));
        if(e.key === 'ArrowRight') showIndex(Math.min(items.length-1,index+1));
      }
    });

    // Simple swipe support using pointer events
    let pointer = { active:false, startX:0, startY:0 };
    imgEl.addEventListener('pointerdown', (e) => {
      pointer.active = true;
      pointer.startX = e.clientX;
      pointer.startY = e.clientY;
      imgEl.setPointerCapture?.(e.pointerId);
    });
    imgEl.addEventListener('pointerup', (e) => {
      if(!pointer.active) return;
      const dx = e.clientX - pointer.startX;
      const dy = e.clientY - pointer.startY;
      pointer.active = false;
      if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if(dx < 0) showIndex(Math.min(items.length-1,index+1));
        else showIndex(Math.max(0,index-1));
      }
    });

  })();
});
