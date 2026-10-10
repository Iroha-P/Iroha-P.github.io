const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const dir = path.resolve(__dirname, '../projects/gradloop');
const pages = ['index.html', 'rag.html', 'agent.html', 'models.html'];
const appSha = 'ad9aafdd79e4e7fbbd4fc6984e507c282eec62db';
const trainingSha = '0364c69f5a9116f927932867dc22d370bb696a87';
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');

test('GradLoop has exactly four linked static chapters with no JavaScript routing requirement', () => {
  assert.deepEqual(fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort(), [...pages].sort());
  for (const file of pages) {
    const html = read(file);
    const nav = html.match(/<div class="nav-links"[\s\S]*?<\/div>/)[0];
    const links = Array.from(nav.matchAll(/<a\b([^>]*data-page-link[^>]*)>/g), match => match[1]);
    assert.equal(links.length, 4, `${file}: chapter links`);
    assert.deepEqual(links.map(attributes => attributes.match(/href="([^"]+)"/)[1]), pages);
    const current = links.filter(attributes => /aria-current="page"/.test(attributes));
    assert.equal(current.length, 1, `${file}: current page`);
    assert.ok(current[0].includes(`href="${file}"`));
    assert.match(html, /aria-label="章节翻页"/);
    assert.match(html, /<h1\b/);
    assert.match(html, /href="#main"/);
    assert.match(html, /src="script.js"/);
    assert.match(html, /href="styles.css"/);
  }
});

test('every chapter resource and fragment resolves to a real target', () => {
  for (const file of pages) {
    const html = read(file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file}: unique IDs`);
    for (const [, href] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      if (/^https?:/.test(href)) continue;
      assert.ok(!/javascript:|data:/.test(href));
      const [resource, fragment] = href.split('#');
      const target = resource ? path.resolve(dir, resource) : path.join(dir, file);
      assert.ok(fs.existsSync(target), `${file}: ${href}`);
      if (fragment) assert.match(fs.readFileSync(target, 'utf8'), new RegExp(`\\bid="${fragment}"`));
    }
    for (const [, attributes] of html.matchAll(/<a\b([^>]+)>/g)) {
      if (/target="_blank"/.test(attributes)) assert.match(attributes, /rel="[^"]*noreferrer/);
    }
    for (const [, attributes] of html.matchAll(/<img\b([^>]+)>/g)) assert.match(attributes, /\balt="/);
    assert.doesNotMatch(html, /<svg\b|<canvas\b|href="#"|TODO|PLACEHOLDER/);
  }
});

test('technical chapters explain implementations with pinned source evidence and substantial depth', () => {
  for (const file of pages.slice(1)) {
    const html = read(file);
    assert.ok((html.match(/<section\b/g) || []).length >= 6, `${file}: detailed sections`);
    assert.ok((html.match(/<h[23]\b/g) || []).length >= 12, `${file}: technical subheadings`);
    assert.ok((html.match(/class="source-note"/g) || []).length >= 5, `${file}: evidence groups`);
    assert.ok(html.includes(appSha) || html.includes(trainingSha));
    assert.ok((html.replace(/<[^>]*>/g, '').match(/[\u4e00-\u9fff]/g) || []).length >= 1600, `${file}: explanatory content`);
    assert.match(html, /<table\b/);
    assert.match(html, /<caption\b/);
    assert.match(html, /<th\b[^>]*scope="col"/);
    for (const [, attributes] of html.matchAll(/<(?:div|pre)\b([^>]*class="(?:table-scroll|code-block)"[^>]*)>/g)) {
      assert.match(attributes, /tabindex="0"/);
      assert.match(attributes, /role="region"/);
      assert.match(attributes, /aria-label="[^"]+"/);
    }
  }
});

test('RAG distinguishes ranking, optional gates, adapters and actual evaluation scope', () => {
  const html = read('rag.html');
  for (const term of ['DocumentInput', 'generic', 'personal', 'KnowledgeDB.add_file', 'MixRetrieveReranker', '0.96875', '0.0', 'fixture_consistency', '未接入默认', '逐句']) assert.ok(html.includes(term), term);
  assert.doesNotMatch(html, /96.9%问答准确率|真实 RAGSDK 全链路已验证/);
});

test('Agent chapter accurately describes bounded routing, recovery and learning state', () => {
  const html = read('agent.html');
  for (const term of ['route_intent', 'retry_search', 'interrupt', 'thread_id', 'trace_id', '80', '连续两次', 'start / node / tool / done / error', '429', 'exactly-once']) assert.ok(html.includes(term), term);
  assert.match(html, /跨请求/);
  assert.match(html, /规则路由/);
  assert.match(html, /旁路/);
});

test('model chapter keeps experimental timelines and incompatible service contracts distinct', () => {
  const html = read('models.html');
  for (const term of ['2026-07-29', '2026-08-27', 'prepared_not_final', '0.1333', 'retain_base', '0.5645', '0.7331', 'max_tokens', 'max_new_tokens', 'public_or_synthetic', '不直接兼容', '来源关联划分', '12,000']) assert.ok(html.includes(term), term);
  assert.ok(html.includes(appSha) && html.includes(trainingSha));
  assert.doesNotMatch(html, /微调显著提升|双仓已一键联通/);
});
