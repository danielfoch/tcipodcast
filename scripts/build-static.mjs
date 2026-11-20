import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const siteEntries = [
  'index.html',
  '404.html',
  'style.css',
  'app.js',
  'data.js',
  'robots.txt',
  'sitemap.xml',
  'assets',
  'blog',
  'episodes',
  'shows',
];

const failures = [];

function fail(message) {
  failures.push(message);
}

async function walk(dir, { skipJunk = false } = {}) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
    if (entry.name === '.DS_Store' || entry.name === '__MACOSX') {
      if (!skipJunk) fail(`junk file present: ${path.relative(root, path.join(dir, entry.name))}`);
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full, { skipJunk }));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function documentUrls(relativePath) {
  const urlPath = `/${relativePath.split(path.sep).join('/')}`;
  if (relativePath === '404.html') {
    return [
      new URL('/404.html', 'https://tci.local'),
      new URL('/this/page/is/missing/', 'https://tci.local'),
    ];
  }
  if (relativePath === 'index.html') {
    return [new URL('/', 'https://tci.local'), new URL('/index.html', 'https://tci.local')];
  }
  if (relativePath.endsWith(`${path.sep}index.html`) || relativePath.endsWith('/index.html')) {
    const directory = urlPath.slice(0, -'index.html'.length);
    return [new URL(directory, 'https://tci.local'), new URL(urlPath, 'https://tci.local')];
  }
  return [new URL(urlPath, 'https://tci.local')];
}

function localPath(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) return `${pathname.slice(1)}index.html`;
  return pathname.slice(1);
}

async function exists(relativePath) {
  try {
    const info = await stat(path.join(root, relativePath));
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function checkHtml(file) {
  const relativePath = path.relative(root, file);
  const html = await readFile(file, 'utf8');
  const baseMatch = html.match(/<base\s+href="([^"]*)"/i);
  if (!baseMatch) {
    fail(`${relativePath} is missing <base href>`);
    return;
  }
  const attrs = [...html.matchAll(/\s(?:href|src)="([^"]*)"/gi)].map((match) => match[1]);
  for (const documentUrl of documentUrls(relativePath)) {
    let baseUrl;
    try {
      baseUrl = new URL(baseMatch[1], documentUrl);
    } catch {
      fail(`${relativePath} has an invalid base href for ${documentUrl.pathname}`);
      continue;
    }
    for (const attr of attrs) {
      if (!attr || attr.startsWith('#') || attr.startsWith('mailto:') || attr.startsWith('tel:') || attr.startsWith('data:') || attr.startsWith('javascript:')) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(attr) || attr.startsWith('//')) continue;
      let resolved;
      try {
        resolved = new URL(attr, baseUrl);
      } catch {
        fail(`${relativePath} has an invalid URL ${attr}`);
        continue;
      }
      if (resolved.origin !== 'https://tci.local') continue;
      const target = localPath(resolved);
      if (!(await exists(target))) {
        fail(`${relativePath} via ${documentUrl.pathname} -> ${attr} missing (${target})`);
      }
    }
  }
}

async function checkSitemap() {
  const xml = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (locs.length === 0) fail('sitemap.xml has no URLs');
  for (const loc of locs) {
    const url = new URL(loc);
    const target = localPath(url);
    if (!(await exists(target))) fail(`sitemap entry missing: ${loc}`);
  }
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
for (const file of htmlFiles) await checkHtml(file);
await checkSitemap();

for (const required of [
  'index.html',
  'style.css',
  'app.js',
  'data.js',
  'shows/canadian-investor/index.html',
  'shows/canadian-real-estate-investor/index.html',
  'shows/canadian-macro-investor/index.html',
  'episodes/index.html',
  'blog/index.html',
  'assets/logo.webp',
  'assets/favicon.png',
]) {
  if (!(await exists(required))) fail(`required file missing: ${required}`);
}

if (failures.length) {
  for (const message of failures) console.error(message);
  process.exit(1);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of siteEntries) {
  await cp(path.join(root, entry), path.join(dist, entry), { recursive: true });
}

const published = await walk(dist, { skipJunk: true });
const unexpected = published.filter((file) => {
  const relative = path.relative(dist, file);
  return relative === 'README.md' || relative.startsWith('scripts') || relative === 'vercel.json' || relative === '.gitignore';
});
if (unexpected.length) {
  console.error(unexpected.map((file) => `unexpected published file: ${path.relative(dist, file)}`).join('\n'));
  process.exit(1);
}

console.log(`Static site verified. Published ${published.length} files to dist/.`);
