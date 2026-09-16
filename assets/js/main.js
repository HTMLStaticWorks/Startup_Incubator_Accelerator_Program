/**
 * main.js - Ventro Template
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initNavbar();
  initScrollUI();
  initCardGlow();
  initFormValidation();
  initPasswordToggles();
  initAnimations();
  initCapTableSim();
  initRoadmap();
  initTestimonialSlider();
  initFAQAccordion();
});

/* --- THEME TOGGLE (Light/Dark Mode) --- */
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle');

  // Default to system preference if no localStorage
  let currentTheme = localStorage.getItem('theme');
  if (!currentTheme) {
    currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(currentTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
      localStorage.setItem('theme', currentTheme);
    });
  });
}

function applyTheme(theme) {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggles.forEach(btn => btn.innerHTML = '<i class="ph ph-sun"></i>');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggles.forEach(btn => btn.innerHTML = '<i class="ph ph-moon"></i>');
  }
}

/* --- RTL TOGGLE --- */
function initRTL() {
  const rtlToggles = document.querySelectorAll('.rtl-toggle');

  let isRTL = localStorage.getItem('rtl') === 'true';
  applyRTL(isRTL);

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      isRTL = !isRTL;
      applyRTL(isRTL);
      localStorage.setItem('rtl', isRTL);
    });
  });
}

function applyRTL(isRTL) {
  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  rtlToggles.forEach(btn => btn.innerHTML = '<i class="ph ph-arrows-left-right"></i>');
}

/* --- NAVBAR & DRAWER --- */
function initNavbar() {
  const navToggle = document.querySelector('.nav-toggle');
  const drawerClose = document.querySelector('.drawer-close');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');

  function openDrawer() {
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (navToggle) navToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close the drawer when a link inside it is followed
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Resize handler to close drawer if > 1024px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeDrawer();
  });
}

/* --- SCROLL UI: condensed navbar, progress bar, back-to-top --- */
function initScrollUI() {
  const navbar = document.querySelector('.navbar');

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<i class="ph ph-arrow-up"></i>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(toTop);

  let ticking = false;

  function update() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(y / max, 1) : 0;

    progress.style.transform = `scaleX(${ratio})`;
    if (navbar) navbar.classList.toggle('scrolled', y > 24);
    toTop.classList.toggle('show', y > 600);

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* --- CARD CURSOR GLOW --- */
function initCardGlow() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, { passive: true });
}

/* --- PASSWORD REVEAL --- */
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.closest('.password-field');
      const input = field && field.querySelector('input');
      if (!input) return;

      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      btn.innerHTML = reveal ? '<i class="ph ph-eye-slash"></i>' : '<i class="ph ph-eye"></i>';
      btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    });
  });
}

/* --- FORM VALIDATION --- */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate="true"]');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          showError(input, 'This field is required');
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          isValid = false;
          showError(input, 'Please enter a valid email address');
        } else if (input.type === 'password' && input.value.length < 8) {
          isValid = false;
          showError(input, 'Password must be at least 8 characters');
        } else {
          clearError(input);
        }
      });

      // Password match check
      const pass = form.querySelector('input[name="password"]');
      const confirmPass = form.querySelector('input[name="confirm_password"]');
      if (pass && confirmPass && pass.value !== confirmPass.value) {
        isValid = false;
        showError(confirmPass, 'Passwords do not match');
      }

      // Checkbox terms check
      const terms = form.querySelector('input[name="terms"]');
      if (terms && !terms.checked) {
        isValid = false;
        showError(terms, 'You must accept the Terms & Conditions');
      }

      if (isValid) {
        // Show success state (no page reload)
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-check-circle"></i> Success!';
        btn.style.background = 'var(--success-color)';
        btn.style.color = '#fff';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.color = '';
          form.reset();
        }, 3000);
      }
    });

    // Clear error on input
    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => clearError(input));
    });
  });
}

function showError(input, message) {
  const formGroup = input.closest('.form-group') || input.parentElement;
  formGroup.classList.add('has-error');
  input.classList.add('form-error');
  input.classList.remove('form-success');

  const errorEl = formGroup.querySelector('.error-message');
  if (errorEl) errorEl.textContent = message;
}

function clearError(input) {
  const formGroup = input.closest('.form-group') || input.parentElement;
  formGroup.classList.remove('has-error');
  input.classList.remove('form-error');
  if (input.value.trim() !== '') {
    input.classList.add('form-success');
  } else {
    input.classList.remove('form-success');
  }
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/* --- ANIMATIONS & COUNTERS --- */
function initAnimations() {
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const statCounters = document.querySelectorAll('.stat-counter');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-up');

        if (entry.target.classList.contains('stat-counter')) {
          animateCounter(entry.target);
        }

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animateElements.forEach(el => observer.observe(el));
  statCounters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const decimals = target % 1 !== 0 ? 1 : 0;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = prefix + target.toFixed(decimals) + suffix;
    return;
  }

  const duration = 1800;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const value = target * eased;
    el.textContent = prefix + value.toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ==========================================================================
   INTERACTIVE - Cap table simulator (index.html)
   ========================================================================== */
function initCapTableSim() {
  const sim = document.getElementById('capSim');
  if (!sim) return;

  const inputs = {
    pre: sim.querySelector('#simPre'),
    ventro: sim.querySelector('#simVentro'),
    round: sim.querySelector('#simRound'),
    esop: sim.querySelector('#simEsop')
  };

  const defaults = {};
  Object.keys(inputs).forEach(key => { defaults[key] = inputs[key].value; });

  const presets = {
    preseed: { pre: 3500000, ventro: 150000, round: 500000, esop: 10 },
    seed: { pre: 8000000, ventro: 250000, round: 2000000, esop: 12 },
    growth: { pre: 18000000, ventro: 500000, round: 4000000, esop: 15 }
  };

  const money = (n) => {
    if (n >= 1000000) {
      const m = n / 1000000;
      return '$' + m.toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
    return '$' + n;
  };

  function paintRange(input) {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  function render() {
    const pre = parseFloat(inputs.pre.value);
    const ventro = parseFloat(inputs.ventro.value);
    const round = parseFloat(inputs.round.value);
    const esop = parseFloat(inputs.esop.value);

    const post = pre + ventro + round;
    const ventroPct = (ventro / post) * 100;
    const roundPct = (round / post) * 100;
    const esopPct = esop;
    const foundersPct = Math.max(100 - ventroPct - roundPct - esopPct, 0);

    // Slider read-outs
    sim.querySelector('#simPreOut').textContent = money(pre);
    sim.querySelector('#simVentroOut').textContent = money(ventro);
    sim.querySelector('#simRoundOut').textContent = round === 0 ? 'None' : money(round);
    sim.querySelector('#simEsopOut').textContent = esop.toFixed(0) + '%';
    Object.values(inputs).forEach(paintRange);

    // KPI tiles
    sim.querySelector('#kpiPost').textContent = money(post);
    sim.querySelector('#kpiFounders').textContent = foundersPct.toFixed(1) + '%';
    sim.querySelector('#kpiCapital').textContent = money(ventro + round);
    sim.querySelector('#kpiDilution').textContent = (100 - foundersPct).toFixed(1) + '% diluted';

    // Stacked ownership meter + legend (values are direct labels)
    const parts = [
      { key: 'founders', label: 'Founders & team', pct: foundersPct },
      { key: 'ventro', label: 'Ventro', pct: ventroPct },
      { key: 'round', label: 'Co-investors', pct: roundPct },
      { key: 'esop', label: 'Option pool', pct: esopPct }
    ];

    parts.forEach((part, i) => {
      const seg = sim.querySelector(`.sim-seg[data-series="${i + 1}"]`);
      const out = sim.querySelector(`#legend-${part.key}`);
      const value = part.pct.toFixed(1) + '%';

      if (seg) {
        seg.style.setProperty('--w', part.pct + '%');
        seg.classList.toggle('is-wide', part.pct >= 11);
        seg.classList.toggle('is-empty', part.pct <= 0.05);
        seg.setAttribute('title', `${part.label}: ${value}`);
        const pctEl = seg.querySelector('.sim-seg-pct');
        if (pctEl) pctEl.textContent = value;
      }
      if (out) out.textContent = value;
    });

    const bar = sim.querySelector('#simBar');
    if (bar) {
      bar.setAttribute('aria-label',
        'Ownership after the round: ' + parts.map(p => `${p.label} ${p.pct.toFixed(1)}%`).join(', '));
    }
  }

  function markPreset(name) {
    sim.querySelectorAll('.sim-preset').forEach(btn => {
      const on = btn.dataset.preset === name;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => {
      render();
      markPreset('');
    });
  });

  sim.querySelectorAll('.sim-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = presets[btn.dataset.preset];
      if (!preset) return;
      Object.keys(preset).forEach(key => { inputs[key].value = preset[key]; });
      render();
      markPreset(btn.dataset.preset);
    });
  });

  const reset = sim.querySelector('#simReset');
  if (reset) {
    reset.addEventListener('click', () => {
      Object.keys(inputs).forEach(key => { inputs[key].value = defaults[key]; });
      render();
      markPreset('preseed');
    });
  }

  render();
}

/* ==========================================================================
   INTERACTIVE - 12-week roadmap explorer (home2.html)
   ========================================================================== */
const ROADMAP_WEEKS = [
  {
    phase: 'Build', title: 'Founder diagnostic & north star',
    desc: 'We pull your business apart: market, moat, team and metrics. You leave week one with a single north-star metric and a 12-week plan built around it.',
    focus: ['Teardown of your current traction story', 'North-star metric + weekly targets', 'Founder working agreement'],
    milestone: 'Growth plan signed off', mentor: 'Sarah Jenkins - Ex-VP Growth, Stripe', output: '12-week operating plan'
  },
  {
    phase: 'Build', title: 'Customer discovery sprint',
    desc: 'Twenty-five structured interviews in five days. We script them, sit in on them, and help you separate what buyers say from what they will pay for.',
    focus: ['25 scripted buyer interviews', 'Jobs-to-be-done mapping', 'Willingness-to-pay signals'],
    milestone: '25 interviews completed', mentor: 'Marcus Chen - Founder, DataScale', output: 'Validated ICP brief'
  },
  {
    phase: 'Build', title: 'Positioning & narrative',
    desc: 'Rewrite the way you describe the company until a stranger repeats it back correctly. Positioning drives your site, your deck and your first sales calls.',
    focus: ['Category and wedge selection', 'Message testing with 10 buyers', 'Homepage rewrite'],
    milestone: 'Narrative test passed', mentor: 'Elena Rodriguez - Partner, Vertex VC', output: 'Positioning one-pager'
  },
  {
    phase: 'Build', title: 'MVP scope lock',
    desc: 'Cut the roadmap to what proves the thesis. Everything that does not move the north-star metric gets parked in writing.',
    focus: ['Ruthless scope triage', 'Two-week shipping cadence', 'Instrumentation and event tracking'],
    milestone: 'Scope frozen', mentor: 'David Kim - CPO, FinBlock', output: 'Shipping roadmap'
  },
  {
    phase: 'Build', title: 'Pricing & unit economics',
    desc: 'Build the model that tells you whether growth makes you money. Most founders discover their pricing is 40% too low here.',
    focus: ['Pricing experiments with live buyers', 'CAC, LTV and payback model', 'Margin structure review'],
    milestone: 'Pricing v2 live', mentor: 'Sarah Jenkins - Ex-VP Growth, Stripe', output: 'Unit economics model'
  },
  {
    phase: 'Growth', title: 'Channel testing',
    desc: 'Run four acquisition channels in parallel with real budget, then kill three. Only the channel with a repeatable cost per qualified lead survives.',
    focus: ['Four parallel channel tests', 'Cost per qualified lead tracking', 'Creative and landing page iteration'],
    milestone: 'One channel with repeatable CAC', mentor: 'Growth partner in residence', output: 'Channel scorecard'
  },
  {
    phase: 'Growth', title: 'Sales motion design',
    desc: 'Turn founder-led selling into something repeatable: a written playbook, a qualified pipeline and a forecast you can actually defend.',
    focus: ['Discovery-to-close script', 'CRM pipeline hygiene', 'Objection handling library'],
    milestone: 'Pipeline 3x quarterly target', mentor: 'Marcus Chen - Founder, DataScale', output: 'Sales playbook'
  },
  {
    phase: 'Growth', title: 'Retention & activation',
    desc: 'Growth without retention is a leaking bucket. We instrument the activation path and fix the two biggest drop-offs.',
    focus: ['Activation funnel instrumentation', 'Onboarding redesign', 'Cohort retention curves'],
    milestone: 'Activation rate up 30%', mentor: 'David Kim - CPO, FinBlock', output: 'Retention dashboard'
  },
  {
    phase: 'Growth', title: 'Metrics that convince',
    desc: 'Assemble the data room investors ask for before they ask. Clean cohorts, honest churn, defensible assumptions.',
    focus: ['Cohort and churn analysis', 'Financial model to 24 months', 'Data room assembly'],
    milestone: 'Data room complete', mentor: 'Elena Rodriguez - Partner, Vertex VC', output: 'Investor-ready metrics pack'
  },
  {
    phase: 'Raise', title: 'Deck & story construction',
    desc: 'Twelve slides, one argument. We build it with you, then tear it down in front of partners from three funds.',
    focus: ['Narrative arc and slide order', 'Traction framing', 'Two live teardown sessions'],
    milestone: 'Deck v3 approved', mentor: 'VC partners in residence', output: 'Investor deck'
  },
  {
    phase: 'Raise', title: 'Investor pipeline & practice',
    desc: 'Build a ranked list of 60 funds, warm the top 20 through our network, and rehearse until the hard questions are boring.',
    focus: ['60-fund ranked target list', 'Warm intro sequencing', 'Mock partner meetings'],
    milestone: '20 warm intros secured', mentor: 'Ventro investor relations', output: 'Raise pipeline'
  },
  {
    phase: 'Raise', title: 'Demo Day & close',
    desc: 'Pitch to 400+ investors, then run a tight process with term sheet support from our team until the round is signed.',
    focus: ['Demo Day stage rehearsals', 'Term sheet negotiation support', 'Post-round hiring plan'],
    milestone: 'Round closed', mentor: 'Ventro partners', output: 'Signed term sheet'
  }
];

function initRoadmap() {
  const root = document.getElementById('roadmap');
  if (!root) return;

  const rail = root.querySelector('#rmRail');
  const phaseBtns = root.querySelectorAll('.roadmap-phase');
  const detail = root.querySelector('#rmDetail');
  const playBtn = root.querySelector('#rmPlay');
  const prevBtn = root.querySelector('#rmPrev');
  const nextBtn = root.querySelector('#rmNext');

  const els = {
    phase: root.querySelector('#rmPhase'),
    title: root.querySelector('#rmTitle'),
    desc: root.querySelector('#rmDesc'),
    list: root.querySelector('#rmList'),
    week: root.querySelector('#rmWeek'),
    milestone: root.querySelector('#rmMilestone'),
    mentor: root.querySelector('#rmMentor'),
    output: root.querySelector('#rmOutput')
  };

  let active = 0;
  let timer = null;

  // Build the week rail
  ROADMAP_WEEKS.forEach((week, i) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'roadmap-node';
    node.textContent = String(i + 1);
    node.setAttribute('role', 'tab');
    node.setAttribute('aria-controls', 'rmDetail');
    node.setAttribute('aria-label', `Week ${i + 1}: ${week.title}`);
    node.addEventListener('click', () => { stop(); select(i, true); });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        stop();
        const next = e.key === 'ArrowRight'
          ? (i + 1) % ROADMAP_WEEKS.length
          : (i - 1 + ROADMAP_WEEKS.length) % ROADMAP_WEEKS.length;
        select(next, true);
        nodes[next].focus();
      }
    });
    rail.appendChild(node);
  });

  const nodes = Array.from(rail.querySelectorAll('.roadmap-node'));

  function select(index, scrollRail) {
    active = index;
    const week = ROADMAP_WEEKS[index];

    nodes.forEach((node, i) => {
      node.classList.toggle('is-active', i === index);
      node.setAttribute('aria-selected', String(i === index));
      node.tabIndex = i === index ? 0 : -1;
    });

    phaseBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.phase === week.phase));

    const phaseNumber = { Build: 1, Growth: 2, Raise: 3 }[week.phase];
    els.phase.textContent = `Phase ${phaseNumber} - ${week.phase}`;
    els.title.textContent = week.title;
    els.desc.textContent = week.desc;
    els.list.innerHTML = week.focus
      .map(item => `<li><i class="ph-fill ph-check-circle"></i><span>${item}</span></li>`)
      .join('');
    els.week.textContent = String(index + 1).padStart(2, '0');
    els.milestone.textContent = week.milestone;
    els.mentor.textContent = week.mentor;
    els.output.textContent = week.output;

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === ROADMAP_WEEKS.length - 1;

    // Re-trigger the entrance animation
    detail.classList.remove('roadmap-fade');
    void detail.offsetWidth;
    detail.classList.add('roadmap-fade');

    // Keep the active node in view on small screens (never on first paint)
    if (scrollRail && rail.scrollWidth > rail.clientWidth) {
      const node = nodes[index];
      rail.scrollTo({ left: node.offsetLeft - (rail.clientWidth - node.offsetWidth) / 2, behavior: 'smooth' });
    }
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (playBtn) playBtn.innerHTML = '<i class="ph-fill ph-play"></i> Auto-play';
  }

  function play() {
    if (playBtn) playBtn.innerHTML = '<i class="ph-fill ph-pause"></i> Pause';
    timer = setInterval(() => {
      select((active + 1) % ROADMAP_WEEKS.length, true);
    }, 3200);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => (timer ? stop() : play()));
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => { stop(); if (active > 0) select(active - 1, true); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { stop(); if (active < ROADMAP_WEEKS.length - 1) select(active + 1, true); });
  }

  phaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stop();
      const first = ROADMAP_WEEKS.findIndex(w => w.phase === btn.dataset.phase);
      if (first > -1) select(first, true);
    });
  });

  // Pause auto-play when the section scrolls out of view
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (!entry.isIntersecting) stop(); });
    }, { threshold: 0.15 }).observe(root);
  }

  select(0, false);
}

/* --- TESTIMONIAL SLIDER --- */
function initTestimonialSlider() {
  const slider = document.getElementById('testimonialSlider');
  const prevBtn = document.querySelector('.testimonial-arrow.prev');
  const nextBtn = document.querySelector('.testimonial-arrow.next');
  const dots = document.querySelectorAll('.testimonial-dot');

  if (!slider) return;

  function getSlideWidth() {
    return slider.clientWidth;
  }

  function updateDots() {
    const currentIndex = Math.round(slider.scrollLeft / getSlideWidth());
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentIndex);
    });
  }

  slider.addEventListener('scroll', updateDots, { passive: true });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      slider.scrollTo({ left: idx * getSlideWidth(), behavior: 'smooth' });
    });
  });
}

/* --- FAQ ACCORDION --- */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      const parent = item.closest('.faq-accordion');
      if (parent) {
        parent.querySelectorAll('.faq-item.active').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('active');
          }
        });
      }

      item.classList.toggle('active', !isOpen);
    });
  });
}
