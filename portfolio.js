const viewTabs = [...document.querySelectorAll('[data-role]')];
function setView(tab) {
  const product = tab.dataset.role === 'pm';
  viewTabs.forEach((t) => {
    t.setAttribute('aria-selected', String(t === tab));
    t.tabIndex = t === tab ? 0 : -1;
  });
  const projects = document.getElementById('projects');
  if (projects) projects.setAttribute('aria-labelledby', tab.id);
  const viewNote = document.getElementById('view-note');
  if (viewNote) viewNote.textContent = product ? '用户问题 / 产品方案 / 验证证据' : '架构实现 / 技术选择 / 验证边界';
  document.querySelectorAll('.project-copy').forEach((p) => {
    p.textContent = product ? p.dataset.product : p.dataset.engineering;
  });
}
viewTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => setView(tab));
  tab.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const next = viewTabs[e.key === 'Home' ? 0 : e.key === 'End' ? viewTabs.length - 1 : (i + 1) % viewTabs.length];
      setView(next);
      next.focus();
    }
  });
});

// 1. Few.io-style project category filter bar (Top Floating Subnav + Section Filter Bar synced)
const filterPills = [...document.querySelectorAll('.filter-pill[data-filter]')];
const subnavTabs = [...document.querySelectorAll('.subnav-tab[data-subfilter]')];
const domainSelect = document.getElementById('few-domain-select');
const globalSelect = document.getElementById('few-global-select');
const projectRows = [...document.querySelectorAll('.few-launch-row[data-category]')];

const applyCategoryFilter = (category, shouldScroll = false) => {
  if (category === 'featured') {
    const feat = document.getElementById('featured');
    if (feat) feat.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  filterPills.forEach((p) => p.classList.toggle('is-active', p.dataset.filter === category));
  subnavTabs.forEach((t) => t.classList.toggle('is-active', t.dataset.subfilter === category));
  if (domainSelect && domainSelect.value !== category) domainSelect.value = category;
  if (globalSelect && globalSelect.value !== category) globalSelect.value = category;
  projectRows.forEach((row) => {
    const match = category === 'all' || row.dataset.category === category;
    row.hidden = !match;
  });
  if (shouldScroll) {
    const workSec = document.getElementById('work');
    if (workSec) workSec.scrollIntoView({ behavior: 'smooth' });
  }
};

filterPills.forEach((pill) => {
  pill.addEventListener('click', () => applyCategoryFilter(pill.dataset.filter));
});
subnavTabs.forEach((tab) => {
  tab.addEventListener('click', () => applyCategoryFilter(tab.dataset.subfilter, true));
});
if (domainSelect) {
  domainSelect.addEventListener('change', (e) => applyCategoryFilter(e.target.value));
}
if (globalSelect) {
  globalSelect.addEventListener('change', (e) => applyCategoryFilter(e.target.value, true));
}

// 1b. Few.io Exclusive Single-Open Accordion in #approach (opening one closes others)
const decisionItems = [...document.querySelectorAll('.decision-accordion .decision-item')];
if (decisionItems.length > 1) {
  // Keep only the 1st item open on initial load, matching Few.io FAQ behavior
  decisionItems.slice(1).forEach((item) => item.removeAttribute('open'));
  decisionItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        decisionItems.forEach((other) => {
          if (other !== item && other.open) other.removeAttribute('open');
        });
      }
    });
  });
}

// 2. Few.io-style Translucent Morphing Cursor (14px dot -> 126px translucent glass "VIEW WORK" on hover -> shrinks back on leave)
//    + Adjacent Row Undulation & Seamless Color-Bleed Gradient Transition
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const rowPalettes = [
  'rgba(99, 102, 241, 0.34)',   // 01 GradLoop: Indigo Blue-Violet
  'rgba(2, 195, 157, 0.32)',    // 02 MultiModal-QC: Emerald Mint-Teal
  'rgba(168, 85, 247, 0.34)',   // 03 AIRI: Electric Purple
  'rgba(236, 72, 153, 0.32)',   // 04 MiniBox: Warm Magenta-Rose
  'rgba(56, 189, 248, 0.30)',   // 05 Code Island: Cyan-Blue
  'rgba(139, 92, 246, 0.34)',   // 06 Image2: Deep Violet
];
projectRows.forEach((row, idx) => {
  row.style.setProperty('--row-accent', rowPalettes[idx % rowPalettes.length]);
  row.style.setProperty('--row-next-accent', rowPalettes[(idx + 1) % rowPalettes.length]);
});

if (finePointer && !reducedMotion) {
  const badge = document.createElement('div');
  badge.className = 'few-cursor-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.innerHTML = '<span>VIEW WORK</span>';
  document.body.appendChild(badge);
  const badgeText = badge.querySelector('span');

  let mouseX = -200;
  let mouseY = -200;
  let curX = -200;
  let curY = -200;
  let rafId = 0;

  const tickCursor = () => {
    curX += (mouseX - curX) * 0.24;
    curY += (mouseY - curY) * 0.24;
    badge.style.left = `${curX.toFixed(1)}px`;
    badge.style.top = `${curY.toFixed(1)}px`;
    if (Math.abs(mouseX - curX) > 0.2 || Math.abs(mouseY - curY) > 0.2) {
      rafId = requestAnimationFrame(tickCursor);
    } else {
      rafId = 0;
    }
  };

  window.addEventListener(
    'mousemove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      badge.classList.add('has-moved');
      if (!rafId) rafId = requestAnimationFrame(tickCursor);
    },
    { passive: true }
  );

  // Adjacent row undulation: mark prev / active / next rows
  const clearRowStates = () => {
    projectRows.forEach((r) => r.classList.remove('is-hovered', 'is-prev-neighbor', 'is-next-neighbor'));
  };

  projectRows.forEach((row, idx) => {
    row.addEventListener('mouseenter', () => {
      clearRowStates();
      row.classList.add('is-hovered');
      if (projectRows[idx - 1]) projectRows[idx - 1].classList.add('is-prev-neighbor');
      if (projectRows[idx + 1]) projectRows[idx + 1].classList.add('is-next-neighbor');
    });
    row.addEventListener('mouseleave', () => {
      clearRowStates();
    });
  });

  // Smart Cursor Logic:
  // - Over ANY text element (especially small copy: p, small, li, code, td, h1-h3, a, button):
  //   Hide "VIEW WORK / VIEW CASE" label so it NEVER collides with text, turn into a pure clean reading lens,
  //   and physically magnify small text elements under the pointer!
  // - Over non-text area of a project card / image / blank row space:
  //   Expand into the 118px "VIEW WORK / VIEW CASE" badge.
  // - Outside cards & text:
  //   Shrink smoothly back to the 14px dot.
  const textSelector = 'p, small, li, code, td, th, blockquote, cite, h1, h2, h3, h4, a, button, summary, .tags span, .stat-kicker, .evidence-stat strong, .rail-meta-item, .about-row';
  const smallTextSelector = 'p, small, li, code, td, .tags span, .project-topline, .case-highlights li, .commerce-states li, .rail-meta-item, .about-row p, .evidence-stat small';

  let lastMagnifiedEl = null;
  const setMagnifiedEl = (el) => {
    if (lastMagnifiedEl === el) return;
    if (lastMagnifiedEl) lastMagnifiedEl.classList.remove('is-cursor-magnified');
    lastMagnifiedEl = el;
    if (lastMagnifiedEl) lastMagnifiedEl.classList.add('is-cursor-magnified');
  };

  window.addEventListener(
    'mousemove',
    (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const cardEl = target.closest('[data-cursor-label]');
      const mediaEl = target.closest('.project-media, .featured-visual, .few-row-arrow');
      const textEl = target.closest(textSelector);
      const smallEl = target.closest(smallTextSelector);

      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        cardEl.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        cardEl.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
      }

      // Case 1: Pointer is over thumbnail/visual/arrow OR blank card background (NO text underneath) -> Show "VIEW WORK / VIEW CASE"
      if (cardEl && (mediaEl || !textEl)) {
        badgeText.textContent = cardEl.dataset.cursorLabel || 'VIEW WORK';
        badge.classList.add('is-expanded');
        badge.classList.remove('is-text-lens');
        setMagnifiedEl(null);
      }
      // Case 2: Pointer is over text (inside or outside a card) -> Hide "VIEW CASE" label, show pure lens, and magnify small text!
      else if (textEl) {
        badge.classList.remove('is-expanded');
        badge.classList.add('is-text-lens');
        setMagnifiedEl(smallEl);
      }
      // Case 3: Blank page background -> Shrink back to 14px dot
      else {
        badge.classList.remove('is-expanded', 'is-text-lens');
        setMagnifiedEl(null);
      }
    },
    { passive: true }
  );
}

// 3. Few.io-style Case Study sticky rail scroll-spy (dim-to-crisp active chapter highlight)
const tocLinks = [...document.querySelectorAll('.few-case-rail .rail-toc-group a[href^="#"]')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const sectionMap = new Map();
  tocLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) sectionMap.set(sec, link);
  });

  const setActiveLink = (activeLink) => {
    tocLinks.forEach((link) => {
      const active = link === activeLink;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const updateByScrollPosition = () => {
    const triggerY = window.innerHeight * 0.32;
    let currentLink = tocLinks[0];
    sectionMap.forEach((link, sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= triggerY) {
        currentLink = link;
      }
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) {
      currentLink = tocLinks[tocLinks.length - 1];
    }
    if (currentLink) setActiveLink(currentLink);
  };

  window.addEventListener('scroll', updateByScrollPosition, { passive: true });
  updateByScrollPosition();
  tocLinks.forEach((link) => {
    link.addEventListener('click', () => setTimeout(updateByScrollPosition, 60));
  });
}

// 4. Few.io-style Floating Glass Header, Full-Screen Hamburger Menu Drawer & Bottom-Right AIRI Mascot Badge
const headerEl = document.querySelector('header');
const isSubpage = window.location.pathname.includes('/cases/') || window.location.pathname.includes('/history/');
const rootPrefix = isSubpage ? '../' : '';

if (headerEl) {
  headerEl.classList.add('few-glass-header');
  const brandSpan = headerEl.querySelector('.brand > span:not(.brand-text)');
  if (brandSpan) {
    brandSpan.className = 'brand-text';
    brandSpan.innerHTML = '<em class="brand-signature" aria-hidden="true">Wednesday</em><span class="brand-name">Iroha-P · AI Product</span>';
  }

  // Inject Second Floating Sub-Navbar (All Industries ▾ | All Services | ...) on subpages right below header
  if (!document.querySelector('.few-subnav-bar')) {
    const subnav = document.createElement('div');
    subnav.className = 'few-subnav-bar wrap';
    subnav.setAttribute('role', 'navigation');
    subnav.setAttribute('aria-label', '悬浮项目快捷导航');
    subnav.innerHTML = `
      <div class="few-industry-select-wrap">
        <select class="few-industry-select" aria-label="快速跳转项目案例" onchange="if(this.value)location.href=this.value">
          <option value="">All Launches ▾</option>
          <option value="${rootPrefix}cases/ecommerce-ai-tools.html">01 SeaMe AI 电商工具平台</option>
          <option value="${rootPrefix}cases/careerpilot.html">02 职航 CareerPilot</option>
          <option value="${rootPrefix}cases/airi-memory.html">03 AIRI Memory Agent</option>
          <option value="${rootPrefix}cases/gradloop.html">04 GradLoop 研循</option>
          <option value="${rootPrefix}cases/multimodal-qc.html">05 MultiModal-QC</option>
          <option value="${rootPrefix}cases/minibox.html">06 MiniBox 语音硬件</option>
          <option value="${rootPrefix}cases/code-island.html">07 Code Island</option>
          <option value="${rootPrefix}cases/image-studio.html">08 Image2 Local Studio</option>
        </select>
      </div>
      <div class="few-subnav-links">
        <a class="subnav-tab" href="${rootPrefix}index.html#work">All Services</a>
        <a class="subnav-tab" href="${rootPrefix}cases/ecommerce-ai-tools.html">Platform &amp; Billing</a>
        <a class="subnav-tab" href="${rootPrefix}cases/careerpilot.html">Agent Orchestration</a>
        <a class="subnav-tab" href="${rootPrefix}cases/airi-memory.html">Long-Term Memory</a>
        <a class="subnav-tab" href="${rootPrefix}cases/gradloop.html">Evidence RAG</a>
        <a class="subnav-tab" href="${rootPrefix}cases/multimodal-qc.html">Multimodal Eval</a>
        <a class="subnav-tab" href="${rootPrefix}cases/minibox.html">Voice Hardware</a>
      </div>
    `;
    headerEl.insertAdjacentElement('afterend', subnav);
  }

  // Inject Page Transition Curtain for smooth route navigation
  if (!document.querySelector('.few-page-curtain')) {
    const curtain = document.createElement('div');
    curtain.className = 'few-page-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = '<span class="curtain-logo">Wednesday</span>';
    document.body.prepend(curtain);
  }
  if (!document.querySelector('.few-ambient-canvas')) {
    const ambient = document.createElement('div');
    ambient.className = 'few-ambient-canvas';
    ambient.setAttribute('aria-hidden', 'true');
    ambient.innerHTML = '<span class="ambient-blob blob-purple"></span><span class="ambient-blob blob-mint"></span><span class="ambient-blob blob-magenta"></span>';
    document.body.prepend(ambient);
  }

  // Upgrade subpage headers to also include the Few.io hamburger button + quick link
  if (!headerEl.querySelector('.few-header-actions')) {
    const existingBack = headerEl.querySelector('.nav-git');
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'few-header-actions';
    if (existingBack) {
      existingBack.classList.add('few-launches-quick');
      actionsDiv.appendChild(existingBack);
    } else {
      const quickLink = document.createElement('a');
      quickLink.className = 'few-launches-quick';
      quickLink.href = `${rootPrefix}index.html#featured`;
      quickLink.innerHTML = '<span class="rocket-icon" aria-hidden="true">🚀</span> LAUNCHES';
      actionsDiv.appendChild(quickLink);
    }
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'few-menu-toggle';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'few-fullscreen-menu');
    toggleBtn.setAttribute('aria-label', '打开全屏主菜单');
    toggleBtn.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
    actionsDiv.appendChild(toggleBtn);
    headerEl.appendChild(actionsDiv);
  }

  const onHeaderScroll = () => {
    headerEl.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();
}

// Ensure Full-Screen Menu Overlay exists on every page (homepage + 8 case pages)
let menuOverlay = document.getElementById('few-fullscreen-menu');
if (!menuOverlay) {
  menuOverlay = document.createElement('div');
  menuOverlay.id = 'few-fullscreen-menu';
  menuOverlay.className = 'few-menu-overlay';
  menuOverlay.setAttribute('aria-hidden', 'true');
  menuOverlay.setAttribute('role', 'dialog');
  menuOverlay.setAttribute('aria-modal', 'true');
  menuOverlay.setAttribute('aria-label', '站点主菜单');
  menuOverlay.innerHTML = `
    <div class="few-menu-glow glow-mint" aria-hidden="true"></div>
    <div class="few-menu-glow glow-purple" aria-hidden="true"></div>
    <div class="few-menu-inner wrap">
      <div class="few-menu-primary">
        <ul class="few-menu-links">
          <li style="--i:0"><a href="${rootPrefix}index.html#featured">CASEBOOK <span class="menu-cn">精选案例</span> <span class="menu-rocket" aria-hidden="true">🚀</span></a></li>
          <li style="--i:1"><a href="${rootPrefix}index.html#work">ALL PROJECTS <span class="menu-cn">项目目录</span></a></li>
          <li style="--i:2"><a href="${rootPrefix}index.html#approach">HOW I WORK <span class="menu-cn">产品判断</span></a></li>
          <li style="--i:3"><a href="${rootPrefix}index.html#contributions">OPEN SOURCE <span class="menu-cn">开源贡献</span></a></li>
          <li style="--i:4"><a href="${rootPrefix}index.html#about">ABOUT ME <span class="menu-cn">能力与背景</span></a></li>
        </ul>
        <div class="few-menu-sublinks">
          <a href="${rootPrefix}cases/ecommerce-ai-tools.html">SEAME CASE</a>
          <a href="${rootPrefix}cases/careerpilot.html">CAREERPILOT</a>
          <a href="${rootPrefix}cases/airi-memory.html">AIRI MEMORY</a>
          <a href="${rootPrefix}projects/gradloop/">GRADLOOP 专题</a>
          <a href="${rootPrefix}history/">VERSION HISTORY</a>
        </div>
      </div>
      <aside class="few-menu-aside" aria-label="个人身份与快速链接">
        <div class="menu-meta-block">
          <span>TARGET ROLE</span>
          <p>AI 产品经理 · Agent 编排<br>大模型应用开发</p>
        </div>
        <div class="menu-meta-block">
          <span>GITHUB</span>
          <p><a href="https://github.com/Iroha-P" target="_blank" rel="noopener">github.com/Iroha-P ↗</a></p>
        </div>
        <div class="menu-meta-block">
          <span>LIVE PLATFORMS</span>
          <p><a href="https://www.seame.ai/zh/" target="_blank" rel="noopener">SeaMe 官方市集 ↗</a><br><a href="${rootPrefix}demo/gradloop/" target="_blank" rel="noopener">GradLoop 公开合成演示 ↗</a></p>
        </div>
      </aside>
    </div>
  `;
  if (headerEl && headerEl.nextSibling) {
    headerEl.parentNode.insertBefore(menuOverlay, headerEl.nextSibling);
  } else {
    document.body.appendChild(menuOverlay);
  }
}

const menuToggleBtn = document.querySelector('.few-menu-toggle');
if (menuToggleBtn && menuOverlay) {
  const setMenuOpen = (open) => {
    menuToggleBtn.classList.toggle('is-open', open);
    menuToggleBtn.setAttribute('aria-expanded', String(open));
    menuToggleBtn.setAttribute('aria-label', open ? '关闭全屏主菜单' : '打开全屏主菜单');
    menuOverlay.classList.toggle('is-open', open);
    menuOverlay.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('few-menu-active', open);
  };

  menuToggleBtn.addEventListener('click', () => {
    const isOpen = menuOverlay.classList.contains('is-open');
    setMenuOpen(!isOpen);
  });

  menuOverlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) {
      setMenuOpen(false);
      menuToggleBtn.focus();
    }
  });
}

// 5. Few.io AnimatedObject staggered scroll-reveal & Footer Card scroll-scale
if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealCandidates = [
    ...document.querySelectorAll(
      '.section-head, .featured-heading, .evidence-strip, .featured-case, .few-launch-row, .contribution-card, .decision-item, .evidence-grid article, .about-row, .case-narrative section, .few-next-launch'
    ),
  ];
  revealCandidates.forEach((el, idx) => {
    el.classList.add('few-reveal');
    el.style.setProperty('--reveal-delay', `${(idx % 4) * 55}ms`);
  });

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  revealCandidates.forEach((el) => revealObs.observe(el));
} else {
  document.querySelectorAll('.few-reveal').forEach((el) => el.classList.add('is-revealed'));
}

// Footer card subtle scroll-scale (Few.io Footer-module scale effect)
const footerCard = document.querySelector('.few-footer-card');
if (footerCard && !reducedMotion) {
  const onFooterScroll = () => {
    const rect = footerCard.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.65)));
    const scale = 0.94 + progress * 0.06;
    footerCard.style.transform = `scale(${scale.toFixed(4)})`;
  };
  window.addEventListener('scroll', onFooterScroll, { passive: true });
  onFooterScroll();
}

// 6. Few.io Smooth Page Transition Curtain on internal route clicks
const curtainEl = document.querySelector('.few-page-curtain');
if (curtainEl && !reducedMotion) {
  requestAnimationFrame(() => {
    curtainEl.classList.add('is-loaded');
  });

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      link.target === '_blank'
    ) {
      return;
    }
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      curtainEl.classList.remove('is-loaded');
      curtainEl.classList.add('is-leaving');
      setTimeout(() => {
        window.location.href = link.href;
      }, 340);
    });
  });
} else if (curtainEl) {
  curtainEl.classList.add('is-loaded');
}

if (!document.querySelector('.few-airi-float')) {
  const targetHref = isSubpage ? '../cases/airi-memory.html' : '#airi';
  const floatEl = document.createElement('a');
  floatEl.className = 'few-airi-float';
  floatEl.href = targetHref;
  floatEl.setAttribute('aria-label', '探索 AIRI 陪伴与长期记忆 Agent');
  floatEl.innerHTML = `
    <span class="airi-float-bubble" aria-hidden="true">Ciallo~(∠・ω&lt; )⌒☆</span>
    <svg class="airi-float-ring" viewBox="0 0 108 108" aria-hidden="true">
      <defs>
        <path id="airi-ring-path" d="M 54,54 m -41,0 a 41,41 0 1,1 82,0 a 41,41 0 1,1 -82,0" />
      </defs>
      <text>
        <textPath href="#airi-ring-path" startOffset="0%">• AIRI AGENT • LET'S CHAT &amp; EXPLORE </textPath>
      </text>
    </svg>
    <span class="airi-float-avatar" aria-hidden="true">
      <img src="${rootPrefix}assets/hero-airi-character-original.png" alt="" width="72" height="72">
    </span>
  `;
  document.body.appendChild(floatEl);
}

