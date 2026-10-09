// 首页与子页面共用的小交互。没有 JavaScript 时，页面内容照样完整可读。
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 湖州（北京时间）的当前时间
  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const format = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const tick = () => {
      const now = new Date();
      for (const clock of clocks) {
        clock.textContent = format.format(now);
        clock.dateTime = now.toISOString();
      }
    };
    tick();
    setInterval(tick, 15000);
  }

  // 顶栏滚动后出现分隔线
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const onScroll = () => topbar.classList.toggle('is-scrolled', scrollY > 8);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  // 当前所在板块高亮对应导航
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const a of navLinks)
            a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
  }

  // 滚动进入视口时淡入
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // 复制邮箱、群号
  for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy;
      let ok = false;
      try {
        // 某些浏览器在页面没拿到焦点时 writeText 会一直挂起，超时就改用旧办法
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800)),
        ]);
        ok = true;
      } catch {
        const area = Object.assign(document.createElement('textarea'), { value: text });
        area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;opacity:0';
        document.body.append(area);
        area.select();
        ok = document.execCommand('copy');
        area.remove();
      }
      button.textContent = ok ? '已复制' : '复制失败，请手动选择';
      button.classList.toggle('is-done', ok);
      clearTimeout(button._timer);
      button._timer = setTimeout(() => {
        button.textContent = button.dataset.label;
        button.classList.remove('is-done');
      }, 1800);
    });
  }

  // 首屏的 QuickSay：点常用语，把它“输入”到右下角的输入框
  const chat = document.querySelector('[data-chat]');
  const phrases = [...document.querySelectorAll('[data-phrase]')];
  if (chat && phrases.length) {
    chat.classList.add('is-hint');
    let index = 0;
    let auto = null;
    const send = (button) => {
      chat.classList.remove('is-hint', 'is-new');
      chat.textContent = button.dataset.phrase;
      void chat.offsetWidth;
      chat.classList.add('is-new');
      for (const b of phrases) b.classList.toggle('is-hit', b === button);
      setTimeout(() => chat.classList.remove('is-new'), 900);
    };
    phrases.forEach((button, i) =>
      button.addEventListener('click', () => {
        clearInterval(auto);
        index = i;
        send(button);
      }),
    );
    if (!reduceMotion) {
      auto = setInterval(() => {
        if (document.hidden) return;
        send(phrases[index % phrases.length]);
        index += 1;
      }, 3200);
    }
  }

  // 桌面构图跟随指针轻微视差
  const desk = document.querySelector('[data-desk]');
  if (desk && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    const layers = [...desk.querySelectorAll('[data-depth]')];
    let frame = 0;
    desk.addEventListener('pointermove', (event) => {
      const rect = desk.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const layer of layers) {
          const d = Number(layer.dataset.depth) * 14;
          const dx = `${(-x * d).toFixed(1)}px`;
          const dy = `${(-y * d).toFixed(1)}px`;
          // 头像本身靠 translate 居中，偏移要叠加在 -50% 上
          layer.style.translate = layer.classList.contains('avatar')
            ? `calc(-50% + ${dx}) calc(-50% + ${dy})`
            : `${dx} ${dy}`;
        }
      });
    });
    desk.addEventListener('pointerleave', () => {
      for (const layer of layers) layer.style.translate = '';
    });
  }
})();
