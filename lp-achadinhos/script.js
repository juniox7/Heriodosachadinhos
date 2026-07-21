/* ===== SCRIPT.JS — LP Achadinhos ===== */

// ---- 1. VAGAS COUNTER (urgência dinâmica) ----
(function initVagasCounter() {
  const el = document.getElementById('vagas-counter');
  if (!el) return;

  // Pega valor salvo ou gera um novo (entre 32 e 57)
  const STORAGE_KEY = 'lp_vagas_count';
  const LAST_UPDATE_KEY = 'lp_vagas_ts';

  let saved = parseInt(localStorage.getItem(STORAGE_KEY));
  let lastTs = parseInt(localStorage.getItem(LAST_UPDATE_KEY) || '0');
  const now = Date.now();

  // Reseta a cada 24h
  if (!saved || now - lastTs > 86400000) {
    saved = Math.floor(Math.random() * 26) + 32; // 32–57
    localStorage.setItem(STORAGE_KEY, saved);
    localStorage.setItem(LAST_UPDATE_KEY, now);
  }

  el.textContent = saved;

  // Diminui o contador lentamente a cada 45–90 segundos
  function decrementSlowly() {
    let current = parseInt(localStorage.getItem(STORAGE_KEY)) || saved;
    if (current <= 3) return;
    current -= 1;
    localStorage.setItem(STORAGE_KEY, current);
    el.textContent = current;

    // próxima redução em 45–90 segundos
    const nextMs = (Math.random() * 45 + 45) * 1000;
    setTimeout(decrementSlowly, nextMs);
  }

  const firstInterval = (Math.random() * 30 + 30) * 1000;
  setTimeout(decrementSlowly, firstInterval);
})();


// ---- 2. FLOATING CTA (aparece após scroll no mobile) ----
(function initFloatingCta() {
  const floating = document.getElementById('floating-cta');
  const hero = document.getElementById('hero');
  if (!floating || !hero) return;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function onScroll() {
    if (!isMobile()) {
      floating.classList.remove('visible');
      return;
    }
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      floating.classList.add('visible');
    } else {
      floating.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ---- 3. SCROLL ANIMATIONS (fade-in) ----
(function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.pain-card, .feature-card, .testimonial-card, .faq-item, .hero-stats'
  );

  targets.forEach(el => el.classList.add('fade-in'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();


// ---- 4. FAQ accordion (fecha outros ao abrir um) ----
(function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    item.addEventListener('toggle', function() {
      if (this.open) {
        items.forEach(other => {
          if (other !== this && other.open) {
            other.open = false;
          }
        });
      }
    });
  });
})();


// ---- 5. UTM PASSTHROUGH (preserva parâmetros de tráfego) ----
(function initUtmPassthrough() {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const hasUtm = utmKeys.some(k => params.has(k));

  if (!hasUtm) return;

  const ctaLinks = document.querySelectorAll('[id^="cta-"]');
  ctaLinks.forEach(link => {
    try {
      const href = link.getAttribute('href');
      if (!href || href === 'SEU_LINK_AQUI') return;
      const url = new URL(href, window.location.origin);
      utmKeys.forEach(k => {
        if (params.has(k)) url.searchParams.set(k, params.get(k));
      });
      link.setAttribute('href', url.toString());
    } catch (e) {}
  });
})();


// ---- 6. TRACK CLICK (console log — substitua pelo seu pixel) ----
(function initTracking() {
  const ctaLinks = document.querySelectorAll('[id^="cta-"]');
  ctaLinks.forEach(link => {
    link.addEventListener('click', function() {
      const cta_id = this.id;

      // Google Analytics 4
      if (typeof gtag === 'function') {
        gtag('event', 'whatsapp_click', { cta_position: cta_id });
      }

      // Meta Pixel
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', { content_name: 'grupo_achadinhos', cta_position: cta_id });
      }

      console.log('[LP] CTA clicado:', cta_id);
    });
  });
})();
