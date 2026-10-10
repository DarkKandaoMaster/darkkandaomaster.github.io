// 砍刀的房间：Three.js 手搭的场景。所有家具都是程序生成的几何体，
// 只有显示器画面、海报和立牌用了网站里已有的图片。
import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';

const ITEMS = {
  monitor: {
    no: '01',
    title: '显示器',
    desc: '屏幕上开着 QuickSay。常用的话和 AI 提示词都存在里面，按 Ctrl+Shift+V 就能呼出来。',
    cta: '去看 QuickSay',
    href: './#work',
    dist: 1.7,
    turn: 0,
  },
  diary: {
    no: '02',
    title: '日记本',
    desc: '我写日记用的是自己做的 LineHush：只有纯文本和图片，敲几个回车就是几个空行。',
    cta: '去看 LineHush',
    href: './#work',
    dist: 1.5,
    turn: 0.15,
  },
  shelf: {
    no: '03',
    title: '书架',
    desc: '书架上放的是我写的 Agent Skills，也就是给 AI 定的工作方法。',
    cta: '去看 Skills',
    href: './#work',
    dist: 2.4,
    turn: -0.2,
  },
  laptop: {
    no: '04',
    title: '不关机的电脑',
    desc: '我睡觉的时候它也开着，让 Claude 接着跑。想知道我最近在忙什么，看这里。',
    cta: '最近在忙什么',
    href: './#about',
    dist: 1.4,
    turn: -0.1,
  },
  standee: {
    no: '05',
    title: '亚克力立牌',
    desc: '这是我的立绘，做成了一个亚克力立牌，摆在桌上陪我写代码。',
    cta: '回到首页',
    href: './',
    dist: 1.15,
    turn: 0,
  },
  keyboard: {
    no: '06',
    title: '键盘',
    desc: '这把键盘上很多键都被我用 AutoHotkey 改过，比如按住右 Alt 就能语音输入。',
    cta: '去看小脚本',
    href: './#scripts',
    dist: 1.4,
    turn: 0.1,
  },
  posters: {
    no: '07',
    title: '墙上的海报',
    desc: '三张都是我在游戏里截的风景照。',
    cta: '',
    href: '',
    dist: 2.6,
    turn: 0.05,
  },
  window: {
    no: '08',
    title: '窗户',
    desc: '外面是湖州的夜。想找我聊聊的话，从这里出去。',
    cta: '联系方式',
    href: './#contact',
    dist: 2.7,
    turn: 0.55,
  },
};
const ORDER = Object.keys(ITEMS);

const room = document.querySelector('.room');
const stage = document.querySelector('[data-stage]');
const canvas = document.querySelector('[data-canvas]');
const loader = document.querySelector('[data-loader]');
const loaderText = document.querySelector('[data-loader-text]');
const hint = document.querySelector('[data-hint]');
const hotspotLayer = document.querySelector('[data-hotspots]');
const detail = {
  no: document.querySelector('[data-detail-no]'),
  title: document.querySelector('[data-detail-title]'),
  desc: document.querySelector('[data-detail-desc]'),
  link: document.querySelector('[data-detail-link]'),
};
const listLinks = [...document.querySelectorAll('[data-item]')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// build() 里会换成真正移动镜头的函数；没有 WebGL 时什么也不做
let focusOn = () => {};

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
} catch {
  room.classList.add('no-webgl');
}

// 列表与详情卡片：没有 WebGL 也能用
let selected = 'monitor';
function showDetail(id) {
  const item = ITEMS[id];
  selected = id;
  detail.no.textContent = item.no;
  detail.title.textContent = item.title;
  detail.desc.textContent = item.desc;
  detail.link.hidden = !item.href;
  if (item.href) {
    detail.link.href = item.href;
    detail.link.textContent = item.cta;
  }
  for (const a of listLinks) a.classList.toggle('is-active', a.dataset.item === id);
  for (const h of hotspots) h.el.classList.toggle('is-active', h.id === id);
}
const hotspots = [];
listLinks.forEach((a) =>
  a.addEventListener('click', (event) => {
    event.preventDefault();
    select(a.dataset.item);
  }),
);
function select(id) {
  showDetail(id);
  if (renderer) focusOn(id);
}
showDetail('monitor');

if (renderer) build();

function build() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1c1a1f');
  scene.fog = new THREE.Fog('#1c1a1f', 9, 16);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 40);
  const home = {
    pos: new THREE.Vector3(2.55, 2.0, 3.15),
    target: new THREE.Vector3(-0.4, 1.1, -1.7),
  };
  camera.position.set(4.6, 3.1, 5.6);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(home.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.1;
  controls.maxDistance = 6.2;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.5;
  controls.minAzimuthAngle = -0.25;
  controls.maxAzimuthAngle = 1.35;
  controls.rotateSpeed = 0.6;

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => {
    loaderText.textContent = `正在搬家具… ${Math.round((loaded / total) * 100)}%`;
  };
  manager.onLoad = () => {
    loader.classList.add('is-done');
    startIntro();
  };
  manager.onError = () => {
    loaderText.textContent = '有张图片没加载出来，不过房间还能逛。';
  };
  const textures = new THREE.TextureLoader(manager);
  const tex = (url, setup) =>
    textures.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      setup?.(t);
    });

  // ---------- 材质与小工具 ----------
  const mat = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
  const box = (w, h, d, material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };
  const canvasTexture = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const pickable = [];
  const groups = {};
  const group = (id) => {
    const g = new THREE.Group();
    g.userData.id = id;
    groups[id] = g;
    scene.add(g);
    return g;
  };
  const register = (id, ...meshes) => {
    for (const m of meshes) {
      m.userData.id = id;
      pickable.push(m);
    }
  };

  // ---------- 房间 ----------
  const floorTex = canvasTexture(1024, 1024, (g, w, h) => {
    const rows = 10;
    for (let r = 0; r < rows; r += 1) {
      let x = (r % 2) * -180;
      while (x < w) {
        const len = 260 + ((r * 97 + x) % 140);
        const shade = 92 + ((r * 31 + x * 7) % 18);
        g.fillStyle = `hsl(27, 34%, ${shade / 3.1}%)`;
        g.fillRect(x, (r * h) / rows, len, h / rows);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.fillRect(x, (r * h) / rows, 2, h / rows);
        x += len;
      }
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.fillRect(0, (r * h) / rows, w, 2);
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(2, 2);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    mat('#ffffff', { map: floorTex, roughness: 0.7 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0.5, 0, 1);
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = mat('#c9b8a6', { roughness: 0.95 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.2), wallMat);
  backWall.position.set(0.5, 2.1, -2.6);
  backWall.receiveShadow = true;
  scene.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.2), wallMat.clone());
  leftWall.material.color.set('#bfae9c');
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-3, 2.1, 1);
  leftWall.receiveShadow = true;
  scene.add(leftWall);
  const trim = mat('#efe6da', { roughness: 0.6 });
  scene.add(box(8, 0.12, 0.03, trim, 0.5, 0.06, -2.585));
  scene.add(box(0.03, 0.12, 8, trim, -2.985, 0.06, 1));

  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 64),
    mat('#ffffff', {
      map: canvasTexture(512, 512, (g, w) => {
        g.fillStyle = '#4b3c47';
        g.fillRect(0, 0, w, w);
        for (let i = 0; i < 6; i += 1) {
          g.strokeStyle = i % 2 ? '#5d4a57' : '#e2672b';
          g.globalAlpha = i % 2 ? 1 : 0.55;
          g.lineWidth = i % 2 ? 14 : 4;
          g.beginPath();
          g.arc(w / 2, w / 2, 70 + i * 32, 0, Math.PI * 2);
          g.stroke();
        }
      }),
    }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.1, 0.004, -0.55);
  rug.receiveShadow = true;
  scene.add(rug);

  // ---------- 书桌 ----------
  const wood = mat('#8a6448', { roughness: 0.55 });
  const deskTop = box(2.5, 0.06, 0.85, wood, -0.05, 0.76, -2.1);
  scene.add(deskTop);
  const legMat = mat('#3a3440', { roughness: 0.5, metalness: 0.3 });
  for (const [x, z] of [
    [-1.25, -2.45],
    [1.15, -2.45],
    [-1.25, -1.75],
    [1.15, -1.75],
  ])
    scene.add(box(0.05, 0.73, 0.05, legMat, x, 0.365, z));

  // 显示器（QuickSay）
  const monitor = group('monitor');
  const bezel = mat('#141317', { roughness: 0.4, metalness: 0.2 });
  monitor.add(box(0.06, 0.3, 0.06, bezel, 0, 0.94, -2.33));
  monitor.add(box(0.28, 0.02, 0.18, bezel, 0, 0.8, -2.33));
  const monitorBody = box(1.0, 0.58, 0.04, bezel, 0, 1.25, -2.3);
  monitor.add(monitorBody);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 0.54),
    new THREE.MeshBasicMaterial({
      map: tex('assets/img/quicksay.jpg', (t) => {
        t.repeat.set(0.6, 1);
      }),
      toneMapped: false,
    }),
  );
  screen.position.set(0, 1.25, -2.278);
  monitor.add(screen);
  monitor.position.x = -0.25;
  register('monitor', monitorBody, screen);
  const screenGlow = new THREE.PointLight('#bcd4ff', 0.9, 2.2, 2);
  screenGlow.position.set(-0.25, 1.25, -1.9);
  scene.add(screenGlow);

  // 键盘（脚本）
  const keyboard = group('keyboard');
  const keyTex = canvasTexture(512, 160, (g, w, h) => {
    g.fillStyle = '#2b2830';
    g.fillRect(0, 0, w, h);
    const cols = 15;
    for (let r = 0; r < 5; r += 1)
      for (let c = 0; c < cols; c += 1) {
        g.fillStyle =
          r === 4 && c > 3 && c < 11 ? '#3b3742' : (r + c) % 7 === 0 ? '#e2672b' : '#efe9e1';
        if (r === 4 && c > 4 && c < 11) continue;
        g.fillRect(
          6 + (c * (w - 12)) / cols,
          6 + (r * (h - 12)) / 5,
          (w - 12) / cols - 6,
          (h - 12) / 5 - 6,
        );
      }
    g.fillStyle = '#efe9e1';
    g.fillRect(
      6 + (5 * (w - 12)) / 15,
      6 + (4 * (h - 12)) / 5,
      (6 * (w - 12)) / 15 - 6,
      (h - 12) / 5 - 6,
    );
  });
  const keyMats = Array(6).fill(mat('#2b2830'));
  keyMats[2] = mat('#ffffff', { map: keyTex, roughness: 0.6 });
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.025, 0.18), keyMats);
  kb.position.set(-0.25, 0.805, -1.83);
  kb.castShadow = kb.receiveShadow = true;
  keyboard.add(kb);
  register('keyboard', kb);

  // 笔记本电脑 + 主机（不关机的电脑）
  const laptop = group('laptop');
  const alu = mat('#8f8a95', { roughness: 0.35, metalness: 0.6 });
  const base = box(0.44, 0.02, 0.3, alu, 0, 0.8, 0);
  laptop.add(base);
  const lid = new THREE.Group();
  lid.position.set(0, 0.81, -0.15);
  lid.rotation.x = -0.32;
  const lidBody = box(0.44, 0.29, 0.015, alu, 0, 0.145, 0);
  lid.add(lidBody);
  const termCanvas = document.createElement('canvas');
  termCanvas.width = 512;
  termCanvas.height = 330;
  const termTex = new THREE.CanvasTexture(termCanvas);
  termTex.colorSpace = THREE.SRGBColorSpace;
  const drawTerm = (caret) => {
    const g = termCanvas.getContext('2d');
    g.fillStyle = '#17161a';
    g.fillRect(0, 0, 512, 330);
    g.font = '22px "JetBrains Mono", Consolas, monospace';
    const lines = [
      ['#8f8a95', '~/LineHush'],
      ['#f0a072', '$ claude'],
      ['#cfc9c0', '> 未保存的修改先暂存，防崩溃'],
      ['#f6c8a6', '● 好的，先看看 SaveQueue…'],
      ['#f6c8a6', '● 已改好 3 处，正在跑测试'],
      ['#8fd19e', '✓ 测试通过'],
    ];
    lines.forEach(([color, text], i) => {
      g.fillStyle = color;
      g.fillText(text, 22, 44 + i * 42);
    });
    if (caret) {
      g.fillStyle = '#e2672b';
      g.fillRect(22, 44 + lines.length * 42 - 20, 12, 24);
    }
    termTex.needsUpdate = true;
  };
  drawTerm(true);
  const termScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.26),
    new THREE.MeshBasicMaterial({ map: termTex, toneMapped: false }),
  );
  termScreen.position.set(0, 0.145, 0.009);
  lid.add(termScreen);
  laptop.add(lid);
  laptop.position.set(0.72, 0, -1.98);
  laptop.rotation.y = -0.35;
  const tower = box(
    0.24,
    0.5,
    0.5,
    mat('#1f1d23', { roughness: 0.4, metalness: 0.3 }),
    0.92,
    0.25,
    -2.1,
  );
  scene.add(tower);
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.42, 0.012),
    new THREE.MeshBasicMaterial({ color: '#ff8a4c', toneMapped: false }),
  );
  led.position.set(0.795, 0.25, -1.88);
  scene.add(led);
  const ledLight = new THREE.PointLight('#ff8a4c', 1.2, 1.6, 2);
  ledLight.position.set(0.7, 0.3, -1.75);
  scene.add(ledLight);
  register('laptop', base, lidBody, termScreen, tower, led);

  // 日记本（LineHush）
  const diary = group('diary');
  const cover = box(0.25, 0.035, 0.33, mat('#e2672b', { roughness: 0.6 }), 0, 0.797, 0);
  const pages = box(0.235, 0.028, 0.315, mat('#fbf6ee'), 0.006, 0.797, 0);
  pages.position.y = 0.798;
  const band = box(0.012, 0.037, 0.33, mat('#f6d7bf'), 0.07, 0.797, 0);
  diary.add(cover, pages, band);
  diary.position.set(-1.0, 0, -1.92);
  diary.rotation.y = 0.28;
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 12), mat('#1f1b17'));
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.5;
  pen.position.set(-0.78, 0.79, -1.82);
  pen.castShadow = true;
  scene.add(pen);
  register('diary', cover, pages, band);

  // 亚克力立牌
  const standee = group('standee');
  const standeeTex = tex('assets/img/standee.webp');
  const figure = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.59),
    new THREE.MeshStandardMaterial({
      map: standeeTex,
      emissiveMap: standeeTex,
      emissive: '#ffffff',
      emissiveIntensity: 0.15,
      transparent: true,
      alphaTest: 0.4,
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
  );
  figure.position.set(0, 1.1, 0);
  figure.castShadow = true;
  const acrylic = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.61, 0.008),
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.05,
      transparent: true,
      opacity: 0.07,
      clearcoat: 1,
      depthWrite: false,
    }),
  );
  acrylic.position.copy(figure.position);
  const standBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.018, 0.1),
    new THREE.MeshPhysicalMaterial({
      color: '#f6f2ff',
      roughness: 0.1,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1,
    }),
  );
  standBase.position.set(0, 0.799, 0);
  standee.add(figure, acrylic, standBase);
  standee.position.set(0.34, 0, -2.05);
  standee.rotation.y = 0.25;
  register('standee', figure, acrylic, standBase);

  // 台灯
  const lampMat = mat('#2d2a33', { roughness: 0.4, metalness: 0.4 });
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.025, 32), lampMat);
  lampBase.position.set(-0.95, 0.802, -2.35);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.55, 12), lampMat);
  lampArm.position.set(-0.95, 1.07, -2.35);
  const lampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.14, 32, 1, true),
    mat('#e2672b', { side: THREE.DoubleSide }),
  );
  lampHead.position.set(-0.86, 1.32, -2.25);
  lampHead.rotation.z = -0.5;
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#fff1d6' }),
  );
  bulb.position.set(-0.84, 1.28, -2.23);
  scene.add(lampBase, lampArm, lampHead, bulb);
  const lampLight = new THREE.SpotLight('#ffc28a', 9, 5, 0.95, 0.6, 1.6);
  lampLight.position.copy(bulb.position);
  lampLight.target.position.set(-0.35, 0.75, -1.85);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  lampLight.shadow.bias = -0.0006;
  scene.add(lampLight, lampLight.target);

  // 马克杯
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.036, 0.09, 24),
    mat('#f4efe8', { roughness: 0.3 }),
  );
  mug.position.set(0.35, 0.835, -1.8);
  mug.castShadow = true;
  scene.add(mug);

  // 书架（Skills）
  const shelf = group('shelf');
  const shelfWood = mat('#6e5039', { roughness: 0.6 });
  const W = 0.85;
  const H = 1.85;
  const D = 0.3;
  const shelfParts = [
    box(0.03, H, D, shelfWood, -W / 2, H / 2, 0),
    box(0.03, H, D, shelfWood, W / 2, H / 2, 0),
    box(W, 0.03, D, shelfWood, 0, H, 0),
    box(W, 0.02, D, shelfWood.clone(), 0, H / 2, -D / 2 + 0.01),
  ];
  shelfParts[3].scale.set(1, H / 0.02, 0.05);
  const palette = [
    '#e2672b',
    '#3f6f9b',
    '#efe6da',
    '#8fae79',
    '#b99ad0',
    '#d9b26a',
    '#c95f4b',
    '#5a7f8f',
  ];
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let s = 0; s < 4; s += 1) {
    const y = 0.05 + s * 0.45;
    shelfParts.push(box(W, 0.03, D, shelfWood, 0, y, 0));
    let x = -W / 2 + 0.04;
    while (x < W / 2 - 0.08) {
      const bw = 0.03 + rand() * 0.04;
      const bh = 0.24 + rand() * 0.12;
      if (rand() > 0.88 && s > 0) {
        x += 0.07;
        continue;
      }
      const book = box(
        bw,
        bh,
        0.2 + rand() * 0.05,
        mat(palette[Math.floor(rand() * palette.length)], { roughness: 0.7 }),
        x + bw / 2,
        y + 0.015 + bh / 2,
        0.02,
      );
      if (rand() > 0.85) book.rotation.z = -0.18;
      shelfParts.push(book);
      x += bw + 0.006;
    }
  }
  shelf.add(...shelfParts);
  shelf.position.set(1.95, 0, -2.42);
  register('shelf', ...shelfParts);

  // 海报
  const posters = group('posters');
  const frameMat = mat('#f4efe8', { roughness: 0.5 });
  [
    ['assets/img/poster-sunset.jpg', -1.15, 2.05, 0.82, -0.03],
    ['assets/img/poster-tree.jpg', -0.15, 2.18, 0.74, 0.015],
    ['assets/img/poster-flowers.jpg', 0.78, 1.98, 0.62, 0.035],
  ].forEach(([url, x, y, w, tilt]) => {
    const h = w * (665 / 1200);
    const frame = box(w + 0.06, h + 0.06, 0.025, frameMat, x, y, -2.58);
    frame.rotation.z = tilt;
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      mat('#ffffff', { map: tex(url), roughness: 0.55 }),
    );
    art.position.set(x, y, -2.565);
    art.rotation.z = tilt;
    posters.add(frame, art);
    register('posters', frame, art);
  });

  // 窗户（左墙）
  const windowGroup = group('window');
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 1.25),
    new THREE.MeshBasicMaterial({
      toneMapped: false,
      map: canvasTexture(520, 500, (g, w, h) => {
        const grad = g.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0b1230');
        grad.addColorStop(1, '#2b2f5a');
        g.fillStyle = grad;
        g.fillRect(0, 0, w, h);
        let s = 3;
        const r = () => (s = (s * 48271) % 2147483647) / 2147483647;
        for (let i = 0; i < 70; i += 1) {
          g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`;
          const size = r() > 0.9 ? 3 : 1.6;
          g.fillRect(r() * w, r() * h * 0.75, size, size);
        }
        g.fillStyle = '#fff3d6';
        g.shadowColor = '#fff3d6';
        g.shadowBlur = 40;
        g.beginPath();
        g.arc(w * 0.7, h * 0.26, 36, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;
        g.fillStyle = '#141a3a';
        for (let i = 0; i < 9; i += 1) {
          const bw = 40 + r() * 40;
          const bh = 60 + r() * 120;
          const bx = i * 60 - 10;
          g.fillRect(bx, h - bh, bw, bh);
          g.fillStyle = 'rgba(255, 200, 130, 0.8)';
          for (let k = 0; k < 6; k += 1)
            if (r() > 0.55)
              g.fillRect(bx + 6 + r() * (bw - 14), h - bh + 10 + r() * (bh - 20), 5, 7);
          g.fillStyle = '#141a3a';
        }
      }),
    }),
  );
  sky.rotation.y = Math.PI / 2;
  sky.position.set(-2.985, 1.9, -0.7);
  const winFrame = mat('#efe6da', { roughness: 0.5 });
  const winParts = [
    box(0.06, 0.07, 1.42, winFrame, -2.97, 2.56, -0.7),
    box(0.1, 0.07, 1.5, winFrame, -2.94, 1.24, -0.7),
    box(0.06, 1.36, 0.07, winFrame, -2.97, 1.9, -1.39),
    box(0.06, 1.36, 0.07, winFrame, -2.97, 1.9, -0.01),
    box(0.04, 1.3, 0.035, winFrame, -2.97, 1.9, -0.7),
    box(0.04, 0.035, 1.35, winFrame, -2.97, 1.9, -0.7),
  ];
  windowGroup.add(sky, ...winParts);
  register('window', sky, ...winParts);
  const moon = new THREE.DirectionalLight('#9fb4ff', 0.9);
  moon.position.set(-5, 3.2, -0.4);
  moon.target.position.set(0, 0.5, -0.6);
  scene.add(moon, moon.target);

  // 椅子
  const chairMat = mat('#2f2b36', { roughness: 0.6 });
  const chair = new THREE.Group();
  const seat = box(0.48, 0.07, 0.46, chairMat, 0, 0.5, 0);
  const back = box(0.46, 0.55, 0.06, chairMat, 0, 0.86, 0.24);
  back.rotation.x = -0.1;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 12), legMat);
  pole.position.set(0, 0.25, 0);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 5), legMat);
  foot.position.set(0, 0.04, 0);
  chair.add(seat, back, pole, foot);
  // 椅子被拉开、转向一边，像刚有人起身
  chair.position.set(-1.55, 0, -1.05);
  chair.rotation.y = -0.9;
  scene.add(chair);

  // 绿植
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.32, 24), mat('#d9cbb8'));
  pot.position.set(-2.45, 0.16, -2.1);
  pot.castShadow = true;
  scene.add(pot);
  const leaf = mat('#5f7f52', { roughness: 0.8 });
  [
    [0, 0.5, 0, 0.2],
    [0.1, 0.65, 0.05, 0.16],
    [-0.08, 0.7, -0.06, 0.15],
    [0.02, 0.82, 0.02, 0.12],
  ].forEach(([x, y, z, r]) => {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leaf);
    s.position.set(-2.45 + x, y, -2.1 + z);
    s.castShadow = true;
    scene.add(s);
  });

  // 环境光
  scene.add(new THREE.HemisphereLight('#ffe7d1', '#2a2430', 0.55));
  scene.add(new THREE.AmbientLight('#ffffff', 0.08));
  const fill = new THREE.PointLight('#ffd7b0', 2.2, 7, 2);
  fill.position.set(1.8, 2.6, 0.8);
  scene.add(fill);

  // ---------- 热点 ----------
  const anchorOf = {
    monitor: new THREE.Vector3(-0.25, 1.62, -2.28),
    diary: new THREE.Vector3(-1.0, 0.92, -1.92),
    shelf: new THREE.Vector3(1.95, 1.98, -2.3),
    laptop: new THREE.Vector3(0.72, 1.18, -2.06),
    standee: new THREE.Vector3(0.34, 1.47, -2.05),
    keyboard: new THREE.Vector3(-0.25, 0.9, -1.78),
    posters: new THREE.Vector3(-0.15, 2.55, -2.55),
    window: new THREE.Vector3(-2.95, 2.4, -0.7),
  };
  for (const id of ORDER) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'hotspot';
    el.setAttribute('aria-label', `${ITEMS[id].no} ${ITEMS[id].title}`);
    el.innerHTML = `<span>${Number(ITEMS[id].no)}</span><em class="hotspot-label">${ITEMS[id].title}</em>`;
    el.addEventListener('click', () => select(id));
    hotspotLayer.append(el);
    hotspots.push({ id, el, anchor: anchorOf[id] });
  }
  showDetail(selected);

  // ---------- 悬停与点击 ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  const highlight = (id, on) => {
    if (!id || !groups[id]) return;
    groups[id].traverse((o) => {
      if (!o.isMesh || !o.material.emissive) return;
      o.material.emissive.set(on ? '#5a2a10' : '#000000');
    });
    if (id === 'laptop') tower.material.emissive.set(on ? '#5a2a10' : '#000000');
  };
  const pick = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickable, false)[0];
    return hit ? hit.object.userData.id : null;
  };
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const id = pick(event);
    if (id !== hovered) {
      highlight(hovered, false);
      hovered = id;
      highlight(hovered, true);
      canvas.classList.toggle('is-pointing', Boolean(id));
    }
  });
  canvas.addEventListener('pointerleave', () => {
    highlight(hovered, false);
    hovered = null;
  });
  let downAt = null;
  canvas.addEventListener('pointerdown', (event) => {
    downAt = [event.clientX, event.clientY];
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!downAt) return;
    const moved = Math.hypot(event.clientX - downAt[0], event.clientY - downAt[1]);
    downAt = null;
    if (moved > 6) return;
    const id = pick(event);
    if (id) select(id);
  });
  controls.addEventListener('start', () => {
    hint.classList.add('is-hidden');
    tween = null;
  });

  // ---------- 镜头 ----------
  let tween = null;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function moveCamera(pos, target, duration = 1.1) {
    if (reduceMotion) {
      camera.position.copy(pos);
      controls.target.copy(target);
      return;
    }
    tween = {
      from: camera.position.clone(),
      fromTarget: controls.target.clone(),
      to: pos.clone(),
      toTarget: target.clone(),
      start: performance.now(),
      duration: duration * 1000,
    };
  }
  focusOn = (id) => {
    // 沿着进门时的镜头方向推近，再按物件稍微转个角度
    const target = anchorOf[id].clone();
    target.y -= id === 'posters' || id === 'window' ? 0.15 : 0.2;
    const dir = home.pos.clone().sub(home.target).normalize();
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), ITEMS[id].turn);
    moveCamera(target.clone().addScaledVector(dir, ITEMS[id].dist), target);
  };
  // 竖屏时房间显得挤，镜头往后退一点
  if (stage.clientWidth < stage.clientHeight * 1.1) {
    home.pos.sub(home.target).multiplyScalar(1.35).add(home.target);
  }
  if (matchMedia('(pointer: coarse)').matches)
    hint.textContent = '拖动转视角 · 双指缩放 · 点物件看看';
  function startIntro() {
    moveCamera(home.pos, home.target, 1.8);
  }
  if (reduceMotion) camera.position.copy(home.pos);

  // ---------- 尺寸与渲染 ----------
  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 640 ? 52 : 42;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  const projected = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  let caretOn = true;
  let lastCaret = 0;
  const clock = new THREE.Clock();
  renderer.setAnimationLoop((now) => {
    const t = clock.getElapsedTime();
    if (tween) {
      const k = Math.min(1, (now - tween.start) / tween.duration);
      const e = ease(k);
      camera.position.lerpVectors(tween.from, tween.to, e);
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
      if (k === 1) tween = null;
    }
    controls.update();
    if (!reduceMotion) {
      led.material.color.setHSL(0.06, 1, 0.55 + Math.sin(t * 2) * 0.08);
      ledLight.intensity = 1.1 + Math.sin(t * 2) * 0.25;
      if (now - lastCaret > 550) {
        caretOn = !caretOn;
        drawTerm(caretOn);
        lastCaret = now;
      }
    }
    renderer.render(scene, camera);

    const { width, height } = stage.getBoundingClientRect();
    for (const h of hotspots) {
      projected.copy(h.anchor).project(camera);
      toCam.copy(camera.position).sub(h.anchor);
      const behind =
        projected.z > 1 || Math.abs(projected.x) > 1.05 || Math.abs(projected.y) > 1.05;
      h.el.classList.toggle('is-behind', behind);
      h.el.style.transform = `translate(${((projected.x + 1) / 2) * width}px, ${((1 - projected.y) / 2) * height}px)`;
    }
  });
}
