const owner = 'Iroha-P';

const repoOverrides = {
  'Iroha-P.github.io': {
    live: 'https://iroha-p.github.io/',
    description: 'Public portfolio homepage for Iroha-P projects, collecting featured pages and repository links in one place.',
    tags: ['Portfolio', 'GitHub Pages', 'Project Index'],
  },
  'airi-gemma': {
    live: 'https://iroha-p.github.io/airi-gemma/',
    description: 'AIRI Gemma local-first memory agent clone with GBrain, LLMWiki, Obsidian-style knowledge workflow and desktop stage.',
    tags: ['Memory Agent', 'GBrain', 'Desktop Stage'],
  },
  'MultiModal-QC': {
    live: 'https://iroha-p.github.io/MultiModal-QC/',
    description: 'Industrial multimodal quality-control demo with Qwen2-VL QLoRA, Agent Pipeline, FastAPI and Gradio.',
    tags: ['Multimodal', 'Qwen2-VL', 'Quality Control'],
  },
  'Code-Island': {
    live: 'https://iroha-p.github.io/Code-Island/',
    description: 'Dynamic Island-style desktop companion for AI coding assistants such as Claude Code and Cursor.',
    tags: ['Windows', 'Agent UI', 'Desktop'],
  },
  'image2-local-studio': {
    live: 'https://iroha-p.github.io/image2-local-studio/',
    description: 'Local GPT Image 2 studio with editable Chinese prompt skills, official native sizes, 4K upscaling and a saved image wall.',
    tags: ['GPT Image 2', 'Prompt Skills', 'Local Studio'],
  },
  'MiniBox': {
    live: 'https://iroha-p.github.io/MiniBox/',
    description: 'Character voice chatbot with GPT-SoVITS TTS, LLM role-playing, Web UI and ESP32 hardware client.',
    tags: ['Voice Chat', 'GPT-SoVITS', 'ESP32'],
  },
  'cc-switch': {
    live: 'https://ccswitch.io',
    description: 'Cross-platform assistant switcher for Claude Code, Codex, OpenCode, OpenClaw, Gemini CLI and Hermes Agent.',
    tags: ['Rust', 'CLI', 'Assistant Tools'],
  },
  'Interlude-Deck': {
    description: 'Codex-aware microlearning companion with timed reward gating and study break mechanics.',
    tags: ['Learning', 'Codex', 'Web'],
  },
  skills: {
    description: 'Public repository for reusable Agent Skills.',
    tags: ['Agent Skills', 'Automation'],
  },
  airi: {
    live: 'https://airi.moeru.ai/docs/',
    description: 'Self-hosted, user-owned companion platform for voice chat, desktop/web companion scenarios and game integrations.',
    tags: ['Companion AI', 'Voice', 'Desktop'],
  },
  FormulaSnap: {
    description: 'Screenshot math formulas, recognize with vision models, convert to MathML and paste into MathType.',
    tags: ['Vision', 'MathML', 'MathType'],
  },
  'claw-code': {
    description: 'Better harness tools for agentic coding workflows, maintained as a Rust-based fork experiment.',
    tags: ['Rust', 'Agent Tools', 'Fork'],
  },
  desktop_status_bar: {
    description: 'Desktop status-bar experiment for lightweight local UI feedback.',
    tags: ['Desktop', 'Status UI'],
  },
};

const fallbackRepos = [
  { name: 'Iroha-P.github.io', language: 'CSS', html_url: 'https://github.com/Iroha-P/Iroha-P.github.io', homepage: 'https://iroha-p.github.io/' },
  { name: 'image2-local-studio', language: 'JavaScript', html_url: 'https://github.com/Iroha-P/image2-local-studio' },
  { name: 'airi-gemma', language: 'TypeScript', html_url: 'https://github.com/Iroha-P/airi-gemma', homepage: 'https://iroha-p.github.io/airi-gemma/' },
  { name: 'MultiModal-QC', language: 'Python', html_url: 'https://github.com/Iroha-P/MultiModal-QC', homepage: 'https://iroha-p.github.io/MultiModal-QC/' },
  { name: 'Code-Island', language: 'C#', html_url: 'https://github.com/Iroha-P/Code-Island', homepage: 'https://iroha-p.github.io/Code-Island/' },
  { name: 'cc-switch', language: 'Rust', html_url: 'https://github.com/Iroha-P/cc-switch', homepage: 'https://ccswitch.io', fork: true },
  { name: 'Interlude-Deck', language: 'JavaScript', html_url: 'https://github.com/Iroha-P/Interlude-Deck' },
  { name: 'skills', language: 'Python', html_url: 'https://github.com/Iroha-P/skills', fork: true },
  { name: 'airi', language: 'TypeScript', html_url: 'https://github.com/Iroha-P/airi', homepage: 'https://airi.moeru.ai/docs/', fork: true },
  { name: 'FormulaSnap', language: 'JavaScript', html_url: 'https://github.com/Iroha-P/FormulaSnap' },
  { name: 'desktop_status_bar', language: 'Python', html_url: 'https://github.com/Iroha-P/desktop_status_bar', fork: true },
  { name: 'MiniBox', language: 'Python', html_url: 'https://github.com/Iroha-P/MiniBox', homepage: 'https://iroha-p.github.io/MiniBox/' },
  { name: 'claw-code', language: 'Rust', html_url: 'https://github.com/Iroha-P/claw-code', fork: true },
];

const grid = document.querySelector('#repoGrid');
const publicRepoCount = document.querySelector('#publicRepoCount');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]));

const normalizeRepo = (repo) => {
  const override = repoOverrides[repo.name] || {};
  const lang = override.lang || repo.language || 'Repository';
  const live = override.live || repo.homepage || '';
  const tags = override.tags || [
    lang,
    repo.fork ? 'Fork' : 'Source',
    live ? 'Live Page' : 'GitHub',
  ];

  return {
    name: repo.name,
    lang,
    description: override.description || repo.description || 'Public GitHub repository.',
    repo: repo.html_url,
    live,
    tags,
  };
};

const renderRepoGrid = (items) => {
  const repos = items.map(normalizeRepo);
  if (publicRepoCount) publicRepoCount.textContent = String(repos.length).padStart(2, '0');

  grid.innerHTML = repos.map((repo) => {
    const live = repo.live ? `<a href="${escapeHtml(repo.live)}">Live</a>` : '';
    return `
      <article class="repo-card">
        <div class="repo-top">
          <h3>${escapeHtml(repo.name)}</h3>
          <span class="repo-lang">${escapeHtml(repo.lang)}</span>
        </div>
        <p>${escapeHtml(repo.description)}</p>
        <div class="pills">${repo.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        <div class="repo-links">
          ${live}
          <a href="${escapeHtml(repo.repo)}">Repo</a>
        </div>
      </article>
    `;
  }).join('');

  revealItems();
};

const parseNextLink = (linkHeader) => {
  if (!linkHeader) return '';
  const match = linkHeader.split(',').find(part => part.includes('rel="next"'));
  return match ? match.match(/<([^>]+)>/)?.[1] || '' : '';
};

const fetchPublicRepos = async () => {
  const repos = [];
  let url = `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`;

  while (url) {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    repos.push(...await response.json());
    url = parseNextLink(response.headers.get('Link'));
  }

  return repos;
};

const loadRepos = async () => {
  renderRepoGrid(fallbackRepos);
  try {
    const repos = await fetchPublicRepos();
    renderRepoGrid(repos);
  } catch (error) {
    console.warn('Using fallback repository list:', error);
  }
};

const activateFeatureCards = () => {
  document.querySelectorAll('.feature-card[data-href]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      window.location.href = card.dataset.href;
    });
    card.addEventListener('keydown', (event) => {
      if (event.target.closest('a')) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = card.dataset.href;
      }
    });
  });
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

const revealItems = () => {
  const items = document.querySelectorAll('.section-head, .feature-card, .repo-card');
  items.forEach((item, index) => {
    if (!item.classList.contains('reveal')) {
      item.classList.add('reveal');
      item.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
      observer.observe(item);
    }
  });
};

activateFeatureCards();
loadRepos();

const petalLayer = document.createDocumentFragment();
const petalCount = window.matchMedia('(max-width: 700px)').matches ? 10 : 18;

for (let index = 0; index < petalCount; index += 1) {
  const petal = document.createElement('span');
  petal.className = 'petal';
  petal.style.setProperty('--x', `${Math.random() * 100}vw`);
  petal.style.setProperty('--size', `${10 + Math.random() * 12}px`);
  petal.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
  petal.style.setProperty('--duration', `${12 + Math.random() * 10}s`);
  petal.style.setProperty('--delay', `${Math.random() * -16}s`);
  petalLayer.appendChild(petal);
}

document.body.appendChild(petalLayer);
