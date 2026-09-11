import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const files = [
  'index.html',
  'resume.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'CNAME',
  '.nojekyll',
];
const projectRoot = resolve(import.meta.dirname, '..');
const output = resolve(projectRoot, 'dist');
// Only clear the generated output inside this project, never a caller-provided path.
if (dirname(output) !== projectRoot) throw new Error('Build output must stay in the project');
await Promise.all(files.map((file) => readFile(resolve(projectRoot, file))));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) {
  await cp(resolve(projectRoot, file), resolve(output, file));
}
await cp(resolve(projectRoot, 'assets'), resolve(output, 'assets'), { recursive: true });
console.log('Static website built in dist/');
