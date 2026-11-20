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

// 1. Few.io-style project category filter bar (Dropdown + Service Tabs synced)
const filterPills = [...document.querySelectorAll('.filter-pill[data-filter]')];
const domainSelect = document.getElementById('few-domain-select');
const projectRows = [...document.querySelectorAll('.few-launch-row[data-category]')];

const applyCategoryFilter = (category) => {
  filterPills.forEach((p) => p.classList.toggle('is-active', p.dataset.filter === category));
  if (domainSelect && domainSelect.value !== category) {
    domainSelect.value = category;
  }
  projectRows.forEach((row) => {
    const match = category === 'all' || row.dataset.category === category;
    row.hidden = !match;
  });
};

filterPills.forEach((pill) => {
  pill.addEventListener('click', () => applyCategoryFilter(pill.dataset.filter));
});
if (domainSelect) {
  domainSelect.addEventListener('change', (e) => applyCategoryFilter(e.target.value));
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

// 2. Few.io-style pointer-tracking row glow & custom cursor badge ("VIEW WORK" / "VIEW CASE")
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (finePointer && !reducedMotion) {
  const badge = document.createElement('div');
  badge.className = 'few-cursor-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.innerHTML = '<span>VIEW WORK</span>';
  document.body.appendChild(badge);
  const badgeText = badge.querySelector('span');

  const targets = [...document.querySelectorAll('[data-cursor-label]')];
  targets.forEach((el) => {
    el.addEventListener('mouseenter', (e) => {
      badgeText.textContent = el.dataset.cursorLabel || 'VIEW WORK';
      badge.classList.add('is-visible');
      badge.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(1)`;
    });
    el.addEventListener('mousemove', (e) => {
      badge.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(1)`;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
    });
    el.addEventListener('mouseleave', (e) => {
      badge.classList.remove('is-visible');
      badge.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(0.4)`;
    });
  });
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

  // Inject ambient dark glow blobs on subpages if not present
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

