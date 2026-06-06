const repos = [
  {
    name: 'Iroha-P.github.io',
    lang: 'CSS',
    description: 'Public portfolio homepage for Iroha-P projects, collecting featured pages and repository links in one place.',
    repo: 'https://github.com/Iroha-P/Iroha-P.github.io',
    live: 'https://iroha-p.github.io/',
    tags: ['Portfolio', 'GitHub Pages', 'Project Index'],
  },
  {
    name: 'airi-gemma',
    lang: 'TypeScript',
    description: 'AIRI Gemma local-first memory agent clone with GBrain, LLMWiki, Obsidian-style knowledge workflow and desktop stage.',
    repo: 'https://github.com/Iroha-P/airi-gemma',
    live: 'https://iroha-p.github.io/airi-gemma/',
    tags: ['Memory Agent', 'GBrain', 'Desktop Stage'],
  },
  {
    name: 'MultiModal-QC',
    lang: 'Python',
    description: 'Industrial multimodal quality-control demo with Qwen2-VL QLoRA, Agent Pipeline, FastAPI and Gradio.',
    repo: 'https://github.com/Iroha-P/MultiModal-QC',
    live: 'https://iroha-p.github.io/MultiModal-QC/',
    tags: ['Multimodal', 'Qwen2-VL', 'Quality Control'],
  },
  {
    name: 'Code-Island',
    lang: 'C#',
    description: 'Dynamic Island-style desktop companion for AI coding assistants such as Claude Code and Cursor.',
    repo: 'https://github.com/Iroha-P/Code-Island',
    live: 'https://iroha-p.github.io/Code-Island/',
    tags: ['Windows', 'Agent UI', 'Desktop'],
  },
  {
    name: 'image2-local-studio',
    lang: 'JavaScript',
    description: 'Local GPT Image 2 studio with editable Chinese prompt skills, official native sizes, 4K upscaling and a saved image wall.',
    repo: 'https://github.com/Iroha-P/image2-local-studio',
    live: 'https://iroha-p.github.io/image2-local-studio/',
    tags: ['GPT Image 2', 'Prompt Skills', 'Local Studio'],
  },
  {
    name: 'cc-switch',
    lang: 'Rust',
    description: 'Cross-platform assistant switcher for Claude Code, Codex, OpenCode, OpenClaw, Gemini CLI and Hermes Agent.',
    repo: 'https://github.com/Iroha-P/cc-switch',
    live: 'https://ccswitch.io',
    tags: ['Rust', 'CLI', 'Assistant Tools'],
  },
  {
    name: 'Interlude-Deck',
    lang: 'JavaScript',
    description: 'Codex-aware microlearning companion with timed reward gating and study break mechanics.',
    repo: 'https://github.com/Iroha-P/Interlude-Deck',
    tags: ['Learning', 'Codex', 'Web'],
  },
  {
    name: 'skills',
    lang: 'Python',
    description: 'Public repository for reusable Agent Skills.',
    repo: 'https://github.com/Iroha-P/skills',
    tags: ['Agent Skills', 'Automation'],
  },
  {
    name: 'airi',
    lang: 'TypeScript',
    description: 'Self-hosted, user-owned companion platform for voice chat, desktop/web companion scenarios and game integrations.',
    repo: 'https://github.com/Iroha-P/airi',
    live: 'https://airi.moeru.ai/docs/',
    tags: ['Companion AI', 'Voice', 'Desktop'],
  },
  {
    name: 'FormulaSnap',
    lang: 'JavaScript',
    description: 'Screenshot math formulas, recognize with vision models, convert to MathML and paste into MathType.',
    repo: 'https://github.com/Iroha-P/FormulaSnap',
    tags: ['Vision', 'MathML', 'MathType'],
  },
  {
    name: 'MiniBox',
    lang: 'Python',
    description: 'Character voice chatbot with GPT-SoVITS TTS, LLM role-playing, Web UI and ESP32 figurine hardware client.',
    repo: 'https://github.com/Iroha-P/MiniBox',
    live: 'https://iroha-p.github.io/MiniBox/',
    tags: ['Voice Chat', 'GPT-SoVITS', 'ESP32'],
  },
  {
    name: 'claw-code',
    lang: 'Rust',
    description: 'Better harness tools for agentic coding workflows, maintained as a Rust-based fork experiment.',
    repo: 'https://github.com/Iroha-P/claw-code',
    tags: ['Rust', 'Agent Tools', 'Fork'],
  },
  {
    name: 'desktop_status_bar',
    lang: 'Python',
    description: 'Desktop status-bar experiment for lightweight local UI feedback.',
    repo: 'https://github.com/Iroha-P/desktop_status_bar',
    tags: ['Desktop', 'Status UI'],
  },
];

const grid = document.querySelector('#repoGrid');

grid.innerHTML = repos.map((repo) => {
  const live = repo.live ? `<a href="${repo.live}">Live</a>` : '';
  return `
    <article class="repo-card">
      <div class="repo-top">
        <h3>${repo.name}</h3>
        <span class="repo-lang">${repo.lang}</span>
      </div>
      <p>${repo.description}</p>
      <div class="pills">${repo.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      <div class="repo-links">
        ${live}
        <a href="${repo.repo}">Repo</a>
      </div>
    </article>
  `;
}).join('');

const revealItems = document.querySelectorAll('.section-head, .feature-card, .repo-card');
revealItems.forEach((item, index) => {
  item.classList.add('reveal');
  item.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealItems.forEach((item) => observer.observe(item));

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
