const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const dir = path.resolve(__dirname, '../projects/gradloop');
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');
const pages = ['index.html', 'rag.html', 'agent.html', 'models.html'];

test('every GradLoop chapter includes a labelled, textual technical figure', () => {
  for (const file of pages) {
    const html = read(file);
    const figures = [...html.matchAll(/<figure\b([^>]*data-diagram="[^"]+"[^>]*)>([\s\S]*?)<\/figure>/g)];
    assert.ok(figures.length >= 1, `${file}: technical figures`);
    for (const [, attributes, body] of figures) {
      assert.match(attributes, /class="[^"]*system-figure/);
      const label = attributes.match(/aria-labelledby="([^"]+)"/);
      assert.ok(label, `${file}: accessible figure name`);
      assert.ok(body.includes(`id="${label[1]}"`));
      assert.match(body, /<figcaption\b/);
      assert.match(body, /class="[^"]*(?:diagram-flow|route-board|comparison-chart)/);
      assert.doesNotMatch(body, /<svg\b|<canvas\b|<img\b|role="img"/);
    }
  }
});

test('overview has a meaningful implementation boundary table rather than only marketing cards', () => {
  const html = read('index.html');
  assert.match(html, /data-diagram="request-architecture"/);
  assert.match(html, /<caption>能力与实际运行边界/);
  assert.match(html, /<th scope="col">验证边界/);
  assert.match(html, /可选生成/);
});

test('Agent diagram has exactly seven exclusive intent branches and retains the precise graph', () => {
  const html = read('agent.html');
  const figure = html.match(/<figure\b[^>]*data-diagram="agent-routing"[\s\S]*?<\/figure>/)[0];
  const branches = [...figure.matchAll(/<li class="route-branch[^\"]*">([\s\S]*?)<\/li>/g)].map(match => match[1]);
  assert.equal(branches.length, 7);
  ['ask', 'plan', 'practice', 'grade', 'mistakes', 'redo', 'revision'].forEach((intent, index) => assert.ok(branches[index].includes(`<strong>${intent} ·`)));
  assert.ok(branches[0].includes('retry_search'));
  assert.ok(branches[3].includes('无 revision_id') && branches[3].includes('有 revision_id'));
  assert.ok(branches[3].includes('interrupt / resume'));
  assert.match(figure, /finalize → END/);
  assert.match(html, /<details class="graph-details"><summary>/);
});

test('model figures distinguish source-component hash buckets and zero observed LoRA gain', () => {
  const html = read('models.html');
  assert.match(html, /data-diagram="source-splits"/);
  assert.match(html, /data-diagram="frozen-comparison"/);
  assert.match(html, /80 个桶/);
  assert.match(html, /不是实际样本占比/);
  const chart = html.match(/<figure\b[^>]*data-diagram="frozen-comparison"[\s\S]*?<\/figure>/)[0];
  const values = [...chart.matchAll(/data-value="([\d.]+)"/g)].map(match => Number(match[1]));
  assert.deepEqual(values, [0, 0, 0.4, 0.4, 0, 0]);
  assert.equal((chart.match(/0\.1333/g) || []).length, 2);
  assert.match(chart, /增益 0/);
  assert.match(chart, /0—1/);
  assert.match(html, /<caption>人工—人工评分一致性/);
});

test('technical diagrams use responsive DOM layout and preserve reduced-motion support', () => {
  const css = read('styles.css');
  for (const selector of ['.system-figure', '.diagram-flow', '.diagram-node', '.route-board', '.comparison-chart', '.split-buckets']) assert.ok(css.includes(selector), selector);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/);
});
