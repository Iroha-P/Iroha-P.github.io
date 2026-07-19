const owner = 'Iroha-P';

const featuredOrder = [
  'MultiModal-QC',
  'airi-gemma',
  'MiniBox',
  'Code-Island',
  'image2-local-studio',
  'FormulaSnap',
  'Interlude-Deck',
  'cc-switch',
];

const repoCopy = {
  'airi-gemma': 'Local-first AIRI memory agent with Gemma, RAG, memory review and LoRA data workflows.',
  'MultiModal-QC': 'Industrial multimodal quality control with Qwen2-VL QLoRA, baselines and an explainable Agent Pipeline.',
  'Code-Island': 'Windows companion that makes AI coding agent state, tool permissions and completion events observable.',
  'image2-local-studio': 'Local image generation workspace with reusable prompt skills, previews and asset history.',
  MiniBox: 'Voice interaction system connecting GPT-SoVITS, LLM services and an ESP32-S3 hardware client.',
  FormulaSnap: 'Vision tool that recognizes formulas from screenshots and converts them for MathType workflows.',
  'Interlude-Deck': 'Codex-aware microlearning companion with study-break and reward-gating mechanics.',
  'cc-switch': 'Cross-platform configuration switcher for coding assistants and local agent runtimes.',
};

const excludedRepoNames = new Set([
  'Iroha-P.github.io',
]);

const fallbackRepos = featuredOrder.map((name) => ({
  name,
  language: {
    'airi-gemma': 'TypeScript',
    'MultiModal-QC': 'Python',
    'Code-Island': 'C#',
    'image2-local-studio': 'JavaScript',
    MiniBox: 'Python',
    FormulaSnap: 'JavaScript',
    'Interlude-Deck': 'JavaScript',
    'cc-switch': 'Rust',
  }[name],
  html_url: `https://github.com/${owner}/${name}`,
}));

const repoList = document.querySelector('#repoList');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const getRepoTime = (repo) => new Date(repo.pushed_at || repo.updated_at || repo.created_at || 0).getTime();

const getDisplayRepos = (repos) => {
  const publicProjectRepos = repos
    .filter((repo) => !excludedRepoNames.has(repo.name))
    .filter((repo) => repo.private !== true)
    .filter((repo) => repo.archived !== true)
    .filter((repo) => repo.fork !== true);

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

  repoList.innerHTML = selected.map((repo) => `
    <article class="repo-item">
      <div>
        <h3>${escapeHtml(repo.name)}</h3>
        <p>${escapeHtml(repoCopy[repo.name] || repo.description || 'Public GitHub repository.')}</p>
      </div>
      <div class="repo-meta">
        <span>${escapeHtml(repo.language || 'Repository')}</span>
        <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer" aria-label="打开 ${escapeHtml(repo.name)} GitHub 仓库">
          <i class="ph ph-arrow-up-right" aria-hidden="true"></i>
        </a>
      </div>
    </article>
  `).join('');
};

const loadRepos = async () => {
  renderRepos(fallbackRepos);

  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) return;

  try {
    const response = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    renderRepos(await response.json());
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

renderRepos(fallbackRepos);
setupReveal();
setupActiveNavigation();
loadRepos();
