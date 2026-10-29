const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function loadScript(fetchImpl) {
  const elements = { '#repoList': { innerHTML: '' }, '#repoStatus': {}, '#copyright': {} };
  const window = {
    location: { hostname: '127.0.0.1' },
    matchMedia: () => ({ matches: true }),
  };
  const context = vm.createContext({
    document: {
      querySelector: (selector) => elements[selector] || null,
      querySelectorAll: () => [],
    },
    window,
    fetch: fetchImpl || (async () => { throw new Error('Offline'); }),
    console: { info() {} },
  });
  vm.runInContext(source, context);
  const api = vm.runInContext('({ getDisplayRepos, renderRepos, loadRepos, fallbackRepos })', context);
  return { ...api, elements, window };
}

const names = (repos) => Array.from(repos, (repo) => repo.name);

test('the homepage explicitly includes LLM applications, Agent and multimodal work', () => {
  assert.match(html, /<title>[^<]*大模型应用[^<]*Agent[^<]*多模态/);
  assert.match(html, /AI 产品经理/);
  assert.match(html, /Agent、RAG 与多模态/);
});

test('GradLoop leads the casebook without removing any existing project', () => {
  const titles = Array.from(html.matchAll(/<h3>(.*?)<\/h3>/g), (match) => match[1]);
  assert.deepEqual(titles.slice(0, 6), [
    'GradLoop', 'MultiModal-QC', 'AIRI Memory Agent', 'MiniBox', 'Code Island', 'Image2 Local Studio',
  ]);
  assert.match(html, /测试集 n=173：Accuracy 89\.02%、F1 0\.893、ROUGE-L 0\.249/);
  assert.match(html, /GPT-SoVITS/);
  assert.match(html, /LoRA\/QLoRA/);
});

test('GradLoop distinguishes the public synthetic demo from the local model lab', () => {
  assert.match(html, /公开演示[^<]*合成语料/);
  assert.match(html, /10\/10/);
  assert.match(html, /固定 5 例评测未获提升，保留 Base/);
  assert.match(html, /https:\/\/github\.com\/Iroha-P\/gradloop-ragsdk-omni-training/);
});

test('case numbers remain consecutive and all local images exist', () => {
  const numbers = Array.from(html.matchAll(/class="case-number [^"]+">(\d+)/g), (match) => match[1]);
  assert.deepEqual(numbers, ['01', '02', '03', '04', '05', '06']);
  for (const [, filename] of html.matchAll(/<img[^>]+src="(assets\/[^\"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, filename)), `Missing image: ${filename}`);
  }
});

test('offline project index starts with both GradLoop repositories and retains multimodal projects', () => {
  const { fallbackRepos } = loadScript();
  assert.deepEqual(names(fallbackRepos).slice(0, 2), ['gradloop-ragsdk-omni', 'gradloop-ragsdk-omni-training']);
  assert.ok(names(fallbackRepos).includes('MultiModal-QC'));
  assert.ok(names(fallbackRepos).includes('MiniBox'));
  assert.ok(!names(fallbackRepos).includes('cc-switch'));
});

test('a successful GitHub snapshot never reintroduces missing, private or archived featured repositories', () => {
  const { getDisplayRepos } = loadScript();
  assert.deepEqual(names(getDisplayRepos([
    { name: 'MultiModal-QC', private: true },
    { name: 'airi-gemma', archived: true },
    { name: 'Iroha-P.github.io' },
    { name: 'actual-public-project', private: false, archived: false },
  ])), ['actual-public-project']);
  assert.deepEqual(names(getDisplayRepos([])), []);
});

test('featured public projects lead, then all other public repositories sort by recency', () => {
  const { getDisplayRepos } = loadScript();
  const repos = [
    { name: 'older', pushed_at: '2026-01-01T00:00:00Z' },
    { name: 'MultiModal-QC' },
    { name: 'recent', pushed_at: '2026-10-01T00:00:00Z' },
    { name: 'gradloop-ragsdk-omni' },
    { name: 'bad-date', pushed_at: 'invalid' },
  ];
  assert.deepEqual(names(getDisplayRepos(repos)), [
    'gradloop-ragsdk-omni', 'MultiModal-QC', 'recent', 'older', 'bad-date',
  ]);
});

test('Fork repositories are labeled instead of presented as original projects', () => {
  const { renderRepos, elements } = loadScript();
  renderRepos([{ name: 'upstream-tool', fork: true, language: 'TypeScript' }]);
  assert.match(elements['#repoList'].innerHTML, /Fork · 上游项目/);
});

test('repository text is escaped and links stay on the owner GitHub namespace', () => {
  const { renderRepos, elements } = loadScript();
  renderRepos([{ name: 'test-project', description: '<img onerror="alert(1)">', html_url: 'javascript:alert(1)' }]);
  const markup = elements['#repoList'].innerHTML;
  assert.match(markup, /&lt;img onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(markup, /href="https:\/\/github\.com\/Iroha-P\/test-project"/);
  assert.doesNotMatch(markup, /javascript:/);
});

test('malformed records do not create fake repository links or break a valid snapshot', () => {
  const { getDisplayRepos } = loadScript();
  assert.deepEqual(names(getDisplayRepos([null, {}, { name: '../unsafe' }, { name: 'valid.repo-1' }])), ['valid.repo-1']);
});

test('local preview uses the dated offline index without requesting the API', async () => {
  let calls = 0;
  const { loadRepos, elements } = loadScript(async () => { calls++; });
  await loadRepos();
  assert.equal(calls, 0);
  assert.match(elements['#repoStatus'].textContent, /2026-10-09/);
  assert.match(elements['#repoList'].innerHTML, /gradloop-ragsdk-omni/);
});

test('live sync renders exactly the current public snapshot', async () => {
  const { loadRepos, elements, window } = loadScript(async () => ({ ok: true, json: async () => [{ name: 'only-public' }] }));
  window.location.hostname = 'iroha-p.github.io';
  await loadRepos();
  assert.match(elements['#repoList'].innerHTML, /only-public/);
  assert.doesNotMatch(elements['#repoList'].innerHTML, /gradloop-ragsdk-omni/);
  assert.match(elements['#repoStatus'].textContent, /已从 GitHub 同步/);
});

test('API failure keeps the working offline index and explains its freshness', async () => {
  const { loadRepos, elements, window } = loadScript(async () => ({ ok: false, status: 403 }));
  window.location.hostname = 'iroha-p.github.io';
  await loadRepos();
  assert.match(elements['#repoList'].innerHTML, /MultiModal-QC/);
  assert.match(elements['#repoStatus'].textContent, /内置索引/);
});

test('a malformed API payload falls back instead of silently erasing the index', async () => {
  const { loadRepos, elements, window } = loadScript(async () => ({ ok: true, json: async () => ({ message: 'error' }) }));
  window.location.hostname = 'iroha-p.github.io';
  await loadRepos();
  assert.match(elements['#repoList'].innerHTML, /MultiModal-QC/);
  assert.match(elements['#repoStatus'].textContent, /内置索引/);
});
