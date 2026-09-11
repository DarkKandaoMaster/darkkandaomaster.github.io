const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');

function syncThemeButton() {
  const isDark = root.dataset.theme === 'dark';
  themeButton?.setAttribute('aria-label', isDark ? '切换到浅色主题' : '切换到深色主题');
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? '#18231e' : '#f7f8f2');
}

syncThemeButton();
themeButton?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem('kandao-theme', root.dataset.theme);
  } catch {
    /* Theme switching also works without storage. */
  }
  syncThemeButton();
});

const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('.project-card');
for (const button of filters) {
  button.addEventListener('click', () => {
    let visibleCount = 0;
    for (const project of projects) {
      const matches =
        button.dataset.filter === 'all' ||
        project.dataset.category.split(' ').includes(button.dataset.filter);
      project.hidden = !matches;
      if (matches) visibleCount++;
    }
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
    document.querySelector('#filter-status').textContent = `当前显示 ${visibleCount} 个作品`;
  });
}

const copyButton = document.querySelector('#copy-email');
copyButton?.addEventListener('click', async () => {
  const feedback = document.querySelector('#copy-feedback');
  feedback.textContent = '';
  copyButton.disabled = true;
  try {
    await navigator.clipboard.writeText('2837619550@qq.com');
    feedback.textContent = '邮箱已复制，期待你的来信。';
  } catch {
    feedback.textContent = '暂时无法自动复制，请手动复制：2837619550@qq.com';
  } finally {
    copyButton.disabled = false;
  }
});

const navLinks = [...document.querySelectorAll('.main-nav a')];
const navSections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
let scrollScheduled = false;
function updateNavigation() {
  const threshold = document.querySelector('.site-header')?.getBoundingClientRect().bottom + 100;
  let activeIndex = -1;
  navSections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= threshold) activeIndex = index;
  });
  // The contact section has its own header link, so clear the numbered navigation there.
  if (document.querySelector('#contact')?.getBoundingClientRect().top <= threshold)
    activeIndex = -1;
  navLinks.forEach((link, index) => {
    if (index === activeIndex) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
if (navLinks.length) {
  const scheduleNavigation = () => {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(updateNavigation);
    }
  };
  window.addEventListener('scroll', scheduleNavigation, { passive: true });
  window.addEventListener('resize', scheduleNavigation);
  updateNavigation();
}

document.querySelector('#print-resume')?.addEventListener('click', () => window.print());
for (const year of document.querySelectorAll('[data-year]'))
  year.textContent = new Date().getFullYear();
root.classList.add('js');
