const owner = 'Iroha-P';

const featuredOrder = [
  'gradloop-ragsdk-omni',
  'gradloop-ragsdk-omni-training',
  'MultiModal-QC',
  'airi-gemma',
  'MiniBox',
  'Code-Island',
  'image2-local-studio',
  'FormulaSnap',
  'Interlude-Deck',
];

const repoCopy = {
  'gradloop-ragsdk-omni': 'RAG + LangGraph 学习与面试训练 Agent：证据引用、人工确认与流式接口；公开演示使用合成语料。',
  'gradloop-ragsdk-omni-training': 'GradLoop 独立模型实验仓：MiniCPM-o、Ascend Base/LoRA smoke 与固定评测记录，不宣称微调质量提升。',
  'airi-gemma': '本地优先的 AIRI 记忆 Agent：Gemma、RAG、记忆审核与 LoRA 候选数据工作流。',
  'MultiModal-QC': 'Qwen2-VL + QLoRA 工业多模态质检，包含传统分类基线、图文 QA 与可解释 Agent Pipeline。',
  'Code-Island': 'AI Coding Agent 的 Windows 桌面工具：展示会话状态、工具权限请求与完成事件。',
  'image2-local-studio': '本地生图应用：可复用 Prompt Skills、生成预览与作品历史管理。',
  MiniBox: 'GPT-SoVITS、LLM 服务与 ESP32-S3 硬件客户端组成的角色语音交互系统。',
  FormulaSnap: '从截图识别公式并转换为 MathType 工作流可用格式的视觉工具。',
  'Interlude-Deck': '感知 Codex 状态的微学习工具，提供学习间歇与奖励门控机制。',
  'c-drive-cache-helper': '先扫描再确认的 Windows 缓存工具，包含安全测试与本地报告。',
};

const excludedRepoNames = new Set([
  'Iroha-P.github.io',
]);

const fallbackRepos = featuredOrder.map((name) => ({
  name,
  language: {
    'gradloop-ragsdk-omni': 'Python',
    'gradloop-ragsdk-omni-training': 'Python',
    'airi-gemma': 'TypeScript',
    'MultiModal-QC': 'Python',
    'Code-Island': 'C#',
    'image2-local-studio': 'JavaScript',
    MiniBox: 'Python',
    FormulaSnap: 'JavaScript',
    'Interlude-Deck': 'JavaScript',
  }[name],
  html_url: `https://github.com/${owner}/${name}`,
}));

const repoList = document.querySelector('#repoList');
const repoStatus = document.querySelector('#repoStatus');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const getRepoTime = (repo) => {
  const time = new Date(repo.pushed_at || repo.updated_at || repo.created_at || 0).getTime();
  return Number.isFinite(time) ? time : 0;
};

const getDisplayRepos = (repos) => {
  const publicProjectRepos = repos
    .filter((repo) => repo && typeof repo.name === 'string' && /^[A-Za-z0-9_.-]+$/.test(repo.name) && !['.', '..'].includes(repo.name))
    .filter((repo) => !excludedRepoNames.has(repo.name))
    .filter((repo) => repo.private !== true)
    .filter((repo) => repo.archived !== true);

  const byName = new Map(publicProjectRepos.map((repo) => [repo.name, repo]));
  const pinned = featuredOrder.map((name) => byName.get(name)).filter(Boolean);
  const pinnedNames = new Set(pinned.map((repo) => repo.name));
  const latest = publicProjectRepos
    .filter((repo) => !pinnedNames.has(repo.name))
    .sort((a, b) => getRepoTime(b) - getRepoTime(a));

  return [...pinned, ...latest];
};

const renderRepos = (repos) => {
  const selected = getDisplayRepos(repos);

  repoList.innerHTML = selected.length ? selected.map((repo) => `
    <article class="repo-item">
      <div>
        <h3>${escapeHtml(repo.name)}</h3>
        ${repo.fork ? '<span class="repo-fork">Fork · 上游项目</span>' : ''}
        <p>${escapeHtml((!repo.fork && repoCopy[repo.name]) || repo.description || '公开 GitHub 仓库。')}</p>
      </div>
      <div class="repo-meta">
        <span>${escapeHtml(repo.language || 'Repository')}</span>
        <a href="https://github.com/${owner}/${encodeURIComponent(repo.name)}" target="_blank" rel="noreferrer" aria-label="打开 ${escapeHtml(repo.name)} GitHub 仓库">
          <i class="ph ph-arrow-up-right" aria-hidden="true"></i>
        </a>
      </div>
    </article>
  `).join('') : '<p class="repo-empty">当前没有可展示的公开项目，请前往 GitHub 查看。</p>';
};

const loadRepos = async () => {
  renderRepos(fallbackRepos);
  repoStatus.textContent = '当前使用 2026-10-09 核对的内置索引；实时仓库状态请以 GitHub 为准。';

  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) return;

  try {
    const response = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const repos = await response.json();
    if (!Array.isArray(repos)) throw new Error('Invalid GitHub repository snapshot');
    renderRepos(repos);
    repoStatus.textContent = '已从 GitHub 同步当前公开仓库；Fork 为上游项目，不作为原创案例。';
  } catch (error) {
    console.info('Using the built-in repository index.', error);
  }
};

const setupReveal = () => {
  const items = document.querySelectorAll('.section-heading, .case-row, .capability-list, .principle-grid, .repo-list');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  items.forEach((item) => {
    item.classList.add('reveal');
    observer.observe(item);
  });
};

const setupActiveNavigation = () => {
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    links.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: [0.05, 0.2, 0.5],
  });

  sections.forEach((section) => observer.observe(section));
};

document.querySelector('#copyright').textContent = `© ${new Date().getFullYear()} Sun Weiming`;

setupReveal();
setupActiveNavigation();
loadRepos();
