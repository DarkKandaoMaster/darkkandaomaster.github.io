// 把 node_modules 里的 three.js 复制到 assets/vendor，网站不依赖 CDN。
// 升级 three 后运行 npm run vendor。
import { copyFile, mkdir } from 'node:fs/promises';

const dir = 'assets/vendor/three';
await mkdir(dir, { recursive: true });
await copyFile('node_modules/three/build/three.module.min.js', `${dir}/three.module.min.js`);
await copyFile(
  'node_modules/three/examples/jsm/controls/OrbitControls.js',
  `${dir}/OrbitControls.js`,
);
await copyFile('node_modules/three/LICENSE', `${dir}/LICENSE.txt`);
console.log('three.js copied to assets/vendor/three');
