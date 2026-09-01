/**
 * 首页体积门槛检查。构建后跑：npm run check:bundle
 *
 * 预算来自 requirements.md §9：
 *   首屏 JS   <= 180KB gzip
 *   字体      <= 400KB
 *   首页图片  <= 1.5MB
 *
 * 超标就 exit 1，可以直接接进 CI。
 *
 * 只读 .next/ 和 public/，不修改任何文件。
 */

import { gzipSync } from 'node:zlib';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const BUDGET = {
  js: 180 * 1024,
  fonts: 400 * 1024,
  images: 1.5 * 1024 * 1024,
};

const KB = 1024;

function fmt(bytes) {
  return bytes >= KB * KB
    ? `${(bytes / KB / KB).toFixed(2)}MB`
    : `${(bytes / KB).toFixed(1)}KB`;
}

async function walk(dir, filter) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await walk(path, filter)));
    } else if (filter(entry.name)) {
      found.push(path);
    }
  }
  return found;
}

/** 首屏 JS：gzip 后累加。Next.js 的 chunks 目录即客户端产物。 */
async function checkJS() {
  const files = await walk('.next/static/chunks', (n) => n.endsWith('.js'));
  if (files.length === 0) {
    console.log('  跳过：未找到构建产物，先跑 npm run build');
    return null;
  }
  let total = 0;
  for (const file of files) {
    total += gzipSync(await readFile(file)).length;
  }
  return total;
}

async function checkDir(dir, exts) {
  const files = await walk(dir, (n) => exts.includes(extname(n).toLowerCase()));
  let total = 0;
  for (const file of files) {
    total += (await stat(file)).size;
  }
  return { total, count: files.length };
}

const results = [];

console.log('\n体积门槛检查\n');

const js = await checkJS();
if (js !== null) {
  results.push(['首屏 JS (gzip)', js, BUDGET.js]);
}

const fonts = await checkDir('public/fonts', ['.woff2', '.woff', '.ttf', '.otf']);
if (fonts.count > 0) {
  results.push(['字体', fonts.total, BUDGET.fonts]);
} else {
  console.log('  字体：public/fonts/ 为空，子集化后再检查');
}

const images = await checkDir('public/profile', ['.avif', '.webp', '.png', '.jpg', '.svg']);
results.push([`首页图片 (${images.count} 个)`, images.total, BUDGET.images]);

let failed = false;
for (const [label, actual, budget] of results) {
  const pct = Math.round((actual / budget) * 100);
  const ok = actual <= budget;
  if (!ok) failed = true;
  console.log(
    `  ${ok ? 'OK  ' : ' 超标'} ${label.padEnd(22)} ${fmt(actual).padStart(9)} / ${fmt(budget).padStart(9)}  (${pct}%)`
  );
}

console.log('');
process.exit(failed ? 1 : 0);
