import { cp, mkdir, readFile } from 'node:fs/promises';

const files = ['index.html', 'resume.html', '404.html', 'robots.txt', 'sitemap.xml', 'CNAME', '.nojekyll'];
await mkdir('dist', { recursive: true });
for (const file of files) {
  await readFile(file);
  await cp(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true });
console.log('Static website built in dist/');
