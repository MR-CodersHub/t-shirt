// ==========================================================================
// PRINTCRAFT STUDIO - Main JavaScript
// ==========================================================================

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Theme Management
  // --------------------------------------------------------------------------
  const themeToggle = () => {
    const saved = localStorage.getItem('pc-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  };

  const updateThemeIcon = (theme) => {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };

  // --------------------------------------------------------------------------
  // RTL / LTR Direction Management ("RTL" text button as the icon)
  // --------------------------------------------------------------------------
  const applyDir = (dir) => {
    document.documentElement.setAttribute('dir', dir === 'rtl' ? 'rtl' : 'ltr');
    document.querySelectorAll('.rtl-toggle').forEach(btn => {
      const isRtl = dir === 'rtl';
      btn.classList.toggle('active', isRtl);
      btn.setAttribute('aria-pressed', isRtl ? 'true' : 'false');
      btn.setAttribute('aria-label', isRtl ? 'Switch to left-to-right (LTR)' : 'Switch to right-to-left (RTL)');
      btn.setAttribute('title', isRtl ? 'Switch to LTR' : 'Switch to RTL');
      btn.textContent = 'RTL';
    });
  };

  const initRtlEarly = () => {
    try {
      const saved = localStorage.getItem('pc-dir');
      if (saved === 'rtl' || saved === 'ltr') {
        document.documentElement.setAttribute('dir', saved);
      } else if (!document.documentElement.getAttribute('dir')) {
        document.documentElement.setAttribute('dir', 'ltr');
      }
    } catch (e) { /* storage unavailable */ }
  };

  initRtlEarly();

  const initRtlToggle = () => {
    try {
      const saved = localStorage.getItem('pc-dir') || document.documentElement.getAttribute('dir') || 'ltr';
      applyDir(saved);
    } catch (e) {
      applyDir(document.documentElement.getAttribute('dir') || 'ltr');
    }

    document.querySelectorAll('.rtl-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
        const next = current === 'rtl' ? 'ltr' : 'rtl';
        applyDir(next);
        try { localStorage.setItem('pc-dir', next); } catch (e) { /* ignore */ }
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    themeToggle();

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('pc-theme', next); } catch (e) { /* ignore */ }
        updateThemeIcon(next);
      });
    });

    initRtlToggle();
  });

  // --------------------------------------------------------------------------
  // Navbar: Scroll Effect & Mobile Menu
  // --------------------------------------------------------------------------
  const initNavbar = () => {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (!navbar) return;

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    if (hamburger && mobileMenu) {
      const setMenu = (open) => {
        hamburger.classList.toggle('active', open);
        mobileMenu.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.style.overflow = open ? 'hidden' : '';
      };

      hamburger.addEventListener('click', () => {
        setMenu(!mobileMenu.classList.contains('open'));
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
      });

      // Never leave the overlay stuck open: Esc closes it, and resizing to
      // desktop (where the hamburger is hidden) force-closes it.
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false);
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && mobileMenu.classList.contains('open')) setMenu(false);
      });
    }
  };

  // --------------------------------------------------------------------------
  // Scroll Reveal Animations
  // --------------------------------------------------------------------------
  const initScrollReveal = () => {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!targets.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) : 0);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => obs.observe(el));
  };

  // --------------------------------------------------------------------------
  // FAQ Accordion
  // --------------------------------------------------------------------------
  const initFaq = () => {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  };

  // --------------------------------------------------------------------------
  // Tabs
  // --------------------------------------------------------------------------
  const initTabs = () => {
    document.querySelectorAll('[data-tabs]').forEach(wrapper => {
      const btns = wrapper.querySelectorAll('.tab-btn');
      const panels = wrapper.querySelectorAll('.tab-panel');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const target = btn.dataset.tab;
          const panel = wrapper.querySelector(`[data-panel="${target}"]`);
          if (panel) panel.classList.add('active');
        });
      });
    });
  };

  // --------------------------------------------------------------------------
  // Filter Pills
  // --------------------------------------------------------------------------
  const initFilters = () => {
    document.querySelectorAll('[data-filter-group]').forEach(group => {
      const pills = group.querySelectorAll('.filter-pill');
      const grid = document.querySelector(group.dataset.filterGroup);
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          pills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const filter = pill.dataset.filter;
          if (!grid) return;
          grid.querySelectorAll('[data-category]').forEach(item => {
            const match = filter === 'all' || item.dataset.category === filter;
            item.style.display = match ? '' : 'none';
          });
        });
      });
    });
  };

  // --------------------------------------------------------------------------
  // Hero Slider
  // --------------------------------------------------------------------------
  const initHeroSlider = () => {
    document.querySelectorAll('[data-slider]').forEach(slider => {
      const slides = slider.querySelectorAll('.slide');
      const dots = slider.querySelectorAll('.slider-dot');
      const prevBtn = slider.querySelector('[data-slider-prev]');
      const nextBtn = slider.querySelector('[data-slider-next]');
      let current = 0;
      let interval;

      if (!slides.length) return;

      const goTo = (idx) => {
        slides[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
      };

      const start = () => { interval = setInterval(() => goTo(current + 1), 5000); };
      const stop = () => clearInterval(interval);

      if (prevBtn) prevBtn.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { stop(); goTo(current + 1); start(); });
      dots.forEach((d, i) => d.addEventListener('click', () => { stop(); goTo(i); start(); }));

      goTo(0);
      start();
    });
  };

  // --------------------------------------------------------------------------
  // Counter Animation
  // --------------------------------------------------------------------------
  const initCounters = () => {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
  };

  // --------------------------------------------------------------------------
  // Image Zoom
  // --------------------------------------------------------------------------
  const initImageZoom = () => {
    const overlay = document.querySelector('.zoom-overlay');
    const overlayImg = overlay?.querySelector('img');
    const closeBtn = overlay?.querySelector('.zoom-close');

    if (!overlay) return;

    document.querySelectorAll('[data-zoom]').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        overlayImg.src = img.src || img.dataset.zoom;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const close = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  };

  // --------------------------------------------------------------------------
  // Drag & Drop Upload
  // --------------------------------------------------------------------------
  const initUploadZones = () => {
    document.querySelectorAll('.upload-zone').forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) handleUpload(zone, files[0]);
      });
      const input = zone.querySelector('input[type="file"]');
      if (input) {
        input.addEventListener('change', () => {
          if (input.files.length) handleUpload(zone, input.files[0]);
        });
      }
    });
  };

  const handleUpload = (zone, file) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = zone.querySelector('.upload-preview');
      if (preview) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
      zone.querySelector('.upload-placeholder')?.classList.add('d-none');
      showToast('Design uploaded successfully!', 'success');
      updateLivePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // --------------------------------------------------------------------------
  // Live Design Preview
  // --------------------------------------------------------------------------
  const updateLivePreview = (imgSrc) => {
    const canvas = document.querySelector('#design-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tshirt = new Image();
    tshirt.src = canvas.dataset.shirt || '';
    tshirt.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tshirt, 0, 0, canvas.width, canvas.height);
      if (imgSrc) {
        const design = new Image();
        design.src = imgSrc;
        design.onload = () => {
          const x = canvas.width * 0.3, y = canvas.height * 0.25;
          const w = canvas.width * 0.4, h = canvas.height * 0.35;
          ctx.drawImage(design, x, y, w, h);
        };
      }
    };
  };

  // --------------------------------------------------------------------------
  // Form Validation
  // --------------------------------------------------------------------------
  const initForms = () => {
    document.querySelectorAll('form[data-validate]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
        form.querySelectorAll('[required]').forEach(field => {
          const error = field.parentElement.querySelector('.form-error');
          if (!field.value.trim()) {
            field.classList.add('error');
            if (error) error.classList.add('visible');
            valid = false;
          } else {
            field.classList.remove('error');
            if (error) error.classList.remove('visible');
            if (field.type === 'email' && !/\S+@\S+\.\S+/.test(field.value)) {
              field.classList.add('error');
              if (error) { error.textContent = 'Enter a valid email.'; error.classList.add('visible'); }
              valid = false;
            }
          }
        });
        if (valid) {
          showToast('Message sent successfully! We\'ll be in touch soon.', 'success');
          form.reset();
        }
      });
    });
  };

  // --------------------------------------------------------------------------
  // Toast Notifications
  // --------------------------------------------------------------------------
  const showToast = (message, type = 'success') => {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon"><i class="fa-solid ${type === 'success' ? 'fa-check' : 'fa-xmark'}" aria-hidden="true"></i></div>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
  };

  window.showToast = showToast;

  // --------------------------------------------------------------------------
  // Color & Size Selectors
  // --------------------------------------------------------------------------
  const initSelectors = () => {
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const group = swatch.closest('.color-swatch-list');
        group?.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const color = swatch.dataset.color;
        if (color) updateShirtColor(color);
      });
    });

    document.querySelectorAll('.size-btn').forEach(btn => {
      if (btn.classList.contains('unavailable')) return;
      btn.addEventListener('click', () => {
        const group = btn.closest('.size-selector');
        group?.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  };

  const updateShirtColor = (color) => {
    const preview = document.querySelector('#shirt-preview');
    if (preview) preview.style.filter = `hue-rotate(${getHueFromColor(color)}deg)`;
  };

  const getHueFromColor = (color) => {
    const map = { white: 0, black: 0, red: 0, blue: 240, green: 120, yellow: 60, purple: 270 };
    return map[color.toLowerCase()] || 0;
  };

  // --------------------------------------------------------------------------
  // Quantity Controls
  // --------------------------------------------------------------------------
  const initQtyControls = () => {
    document.querySelectorAll('.qty-control').forEach(ctrl => {
      const input = ctrl.querySelector('.qty-input');
      const plus = ctrl.querySelector('[data-qty="plus"]');
      const minus = ctrl.querySelector('[data-qty="minus"]');
      if (!input) return;
      if (plus) plus.addEventListener('click', () => { input.value = parseInt(input.value || 1) + 1; });
      if (minus) minus.addEventListener('click', () => { input.value = Math.max(1, parseInt(input.value || 1) - 1); });
    });
  };

  // --------------------------------------------------------------------------
  // Placement Tabs (Design Studio)
  // --------------------------------------------------------------------------
  const initPlacementTabs = () => {
    document.querySelectorAll('[data-placement]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-placement]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  };

  // --------------------------------------------------------------------------
  // Dashboard Sidebar Nav
  // --------------------------------------------------------------------------
  const initDashboardNav = () => {
    const dashLinks = document.querySelectorAll('.dash-nav-link');
    const dashPanels = document.querySelectorAll('.dash-panel');
    dashLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        dashLinks.forEach(l => l.classList.remove('active'));
        dashPanels.forEach(p => p.classList.remove('active'));
        link.classList.add('active');
        const target = link.dataset.panel;
        const panel = document.querySelector(`[data-dash-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  };

  // --------------------------------------------------------------------------
  // Search
  // --------------------------------------------------------------------------
  const initSearch = () => {
    const searchInput = document.querySelector('[data-search]');
    if (!searchInput) return;
    const target = document.querySelector(searchInput.dataset.search);
    if (!target) return;
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      target.querySelectorAll('[data-searchable]').forEach(item => {
        const text = item.dataset.searchable.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  };

  // --------------------------------------------------------------------------
  // Scroll Progress Bar
  // --------------------------------------------------------------------------
  const initScrollProgress = () => {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / total) * 100;
      bar.style.width = `${progress}%`;
    }, { passive: true });
  };

  // --------------------------------------------------------------------------
  // Back to Top
  // --------------------------------------------------------------------------
  const initBackToTop = () => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  // --------------------------------------------------------------------------
  // Countdown Timer (Coming Soon)
  // --------------------------------------------------------------------------
  const initCountdown = () => {
    const el = document.querySelector('[data-countdown]');
    if (!el) return;
    const target = new Date(el.dataset.countdown);

    const update = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) { el.textContent = 'Launched!'; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.querySelector('[data-days]') && (el.querySelector('[data-days]').textContent = String(d).padStart(2, '0'));
      el.querySelector('[data-hours]') && (el.querySelector('[data-hours]').textContent = String(h).padStart(2, '0'));
      el.querySelector('[data-mins]') && (el.querySelector('[data-mins]').textContent = String(m).padStart(2, '0'));
      el.querySelector('[data-secs]') && (el.querySelector('[data-secs]').textContent = String(s).padStart(2, '0'));
    };
    update();
    setInterval(update, 1000);
  };

  // --------------------------------------------------------------------------
  // Smooth Anchor Scroll
  // --------------------------------------------------------------------------
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  };

  // --------------------------------------------------------------------------
  // Active Nav Link (based on current page)
  // --------------------------------------------------------------------------
  const initActiveNav = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a, .mobile-menu-nav a').forEach(a => {
      const href = a.getAttribute('href')?.split('/').pop();
      if (href === path) a.classList.add('active');
    });
  };

  // --------------------------------------------------------------------------
  // Navbar Profile Dropdown (click to open / close)
  // --------------------------------------------------------------------------
  const initProfileDropdown = () => {
    const wrapper = document.querySelector('.profile-dropdown');
    if (!wrapper) return;
    const btn = wrapper.querySelector('.profile-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        wrapper.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    wrapper.querySelectorAll('.profile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        wrapper.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  };

  // --------------------------------------------------------------------------
  // Init All
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initProfileDropdown();
    initScrollReveal();
    initFaq();
    initTabs();
    initFilters();
    initHeroSlider();
    initCounters();
    initImageZoom();
    initUploadZones();
    initForms();
    initSelectors();
    initQtyControls();
    initPlacementTabs();
    initDashboardNav();
    initSearch();
    initScrollProgress();
    initBackToTop();
    initCountdown();
    initSmoothScroll();
    initActiveNav();
  });

})();
