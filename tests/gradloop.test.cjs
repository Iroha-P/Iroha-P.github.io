const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const pageRoot = path.join(root, 'projects', 'gradloop');
const pagePath = path.join(pageRoot, 'index.html');
const readPage = () => fs.readFileSync(pagePath, 'utf8');

test('GradLoop has an independent static project page with its verified full name', () => {
  assert.ok(fs.existsSync(pagePath));
  const html = readPage();
  assert.match(html, /<title>GradLoop RAGSDK Omni/);
  assert.match(html, /<h1[^>]*>[\s\S]*?GradLoop[\s\S]*?RAGSDK Omni[\s\S]*?<\/h1>/);
  assert.match(html, /证据约束的全模态学习与面试训练 Agent/);
  assert.match(html, /lang="zh-CN"/);
});

test('homepage links to the detail page without replacing its existing demo or repositories', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /href="projects\/gradloop\/"/);
  assert.match(html, /href="https:\/\/gradloop-ragsdk-omni\.pages\.dev\/"/);
  assert.match(html, /href="https:\/\/github\.com\/Iroha-P\/gradloop-ragsdk-omni-training"/);
});

test('every local link, image, stylesheet and script on the project page resolves', () => {
  const html = readPage();
  const ids = new Set(Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]));
  for (const [, url] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (/^https?:/.test(url)) continue;
    if (url.startsWith('#')) {
      assert.ok(ids.has(url.slice(1)), `Missing anchor: ${url}`);
      continue;
    }
    const localPath = path.resolve(pageRoot, url.split('#')[0]);
    assert.ok(fs.existsSync(localPath), `Missing local resource: ${url}`);
  }
});

test('external links open safely and demo/source actions are real links', () => {
  const html = readPage();
  for (const [, attributes] of html.matchAll(/<a\b([^>]+)>/g)) {
    if (/target="_blank"/.test(attributes)) assert.match(attributes, /rel="[^"]*noreferrer/);
    assert.doesNotMatch(attributes, /href="(?:javascript:|#")/);
  }
  assert.match(html, /href="https:\/\/gradloop-ragsdk-omni\.pages\.dev\/"[^>]*>[\s\S]*?体验公开 Demo/);
});

test('the showcase distinguishes synthetic replay, model smoke and unverified runtime', () => {
  const html = readPage();
  assert.match(html, /公开入口使用合成素材/);
  assert.match(html, /实时音视频仍待验收/);
  assert.match(html, /真实 RAGSDK 运行时尚未验证/);
  assert.match(html, /MiniCPM-o 4\.5/);
  assert.match(html, /固定 5 例评测未获提升，保留 Base/);
  assert.match(html, /10\/10/);
  assert.doesNotMatch(html, /RAGSDK 全链路已运行|在线全模态已验收|LIVE|100%|获奖|冠军/);
});

test('the screenshot opens as a real image without JavaScript and has an accessible enhanced dialog', () => {
  const html = readPage();
  assert.match(html, /<a[^>]+href="\.\.\/\.\.\/assets\/gradloop-public-qa\.png"[^>]+data-preview/);
  assert.match(html, /<dialog[^>]+aria-labelledby="preview-title"/);
  assert.match(html, /<button[^>]+data-close-preview[^>]*>/);
  assert.match(html, /href="#main"/);
  for (const [, attributes] of html.matchAll(/<img\b([^>]+)>/g)) assert.match(attributes, /\balt="[^"]*"/);
});

test('the page adds no backend, analytics, model calls or fabricated decorative art', () => {
  const script = fs.readFileSync(path.join(pageRoot, 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(pageRoot, 'styles.css'), 'utf8');
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|innerHTML|document\.cookie/);
  assert.doesNotMatch(readPage(), /<svg\b|<canvas\b|data:image/);
  assert.doesNotMatch(css, /(?:linear|radial|conic)-gradient\(/);
  assert.match(css, /hero-paper\.png/);
  assert.match(css, /prefers-reduced-motion/);
});
