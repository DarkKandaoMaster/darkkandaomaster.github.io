import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { dirs, pages, rootFiles } from './site-files.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
const output = resolve(projectRoot, 'dist');
// Only clear the generated output inside this project, never a caller-provided path.
if (dirname(output) !== projectRoot) throw new Error('Build output must stay in the project');
const files = [...pages, ...rootFiles];
await Promise.all(files.map((file) => readFile(resolve(projectRoot, file))));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) {
  await mkdir(dirname(resolve(output, file)), { recursive: true });
  await cp(resolve(projectRoot, file), resolve(output, file));
}
for (const dir of dirs) {
  await cp(resolve(projectRoot, dir), resolve(output, dir), { recursive: true });
}
console.log('Static website built in dist/');
