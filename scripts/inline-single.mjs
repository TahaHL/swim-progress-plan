/**
 * Turns the single-file build into one self-contained HTML file by inlining its script and
 * stylesheet. Fonts are already inlined by the build (see vite.config.ts).
 *
 *   npm run build:single   ->   dist-single/index.html
 */
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = new URL('../dist-single/', import.meta.url).pathname;
let html = await readFile(join(dir, 'index.html'), 'utf8');
const read = (href) => readFile(join(dir, href.replace(/^\.\//, '')), 'utf8');

const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
if (scripts.length !== 1) throw new Error(`Expected one script in the single-file build, found ${scripts.length}.`);

for (const [tag, src] of scripts) {
  const code = (await read(src)).replaceAll('</script', '<\\/script');
  html = html.replace(tag, () => `<script type="module">${code}</script>`);
}
for (const [tag, href] of styles) {
  const css = await read(href);
  html = html.replace(tag, () => `<style>${css}</style>`);
}
html = html.replace(/\s*<link\b[^>]*rel="modulepreload"[^>]*>/g, '');

await writeFile(join(dir, 'index.html'), html);
await rm(join(dir, 'assets'), { recursive: true, force: true });
console.log(`dist-single/index.html  ${(Buffer.byteLength(html) / 1024).toFixed(0)} kB (self-contained)`);
