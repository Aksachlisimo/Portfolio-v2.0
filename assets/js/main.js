(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // Theme toggle
  const themeBtn = document.querySelector('.theme');
  const isDark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  themeBtn?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu
  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Nav border on scroll + active link
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navMap = new Map([...links.querySelectorAll('a[href^="#"]:not(.btn)')].map(a => [a.getAttribute('href').slice(1), a]));
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navMap.forEach(a => a.classList.remove('active'));
      navMap.get(en.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

  // Reveal on scroll
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Contact form via FormSubmit AJAX endpoint (falls back to normal POST without JS)
  const form = document.querySelector('.form');
  const status = form?.querySelector('.form__status');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) valid = false;
    });
    if (!valid) { status.className = 'form__status err'; status.textContent = 'Please fill in your name, a valid email and a message.'; return; }

    const btn = form.querySelector('button');
    btn.disabled = true; btn.textContent = 'Sending…';
    status.className = 'form__status'; status.textContent = '';
    try {
      const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === 'false' || data.success === false) throw new Error(data.message || 'Request failed');
      form.reset();
      status.className = 'form__status ok';
      status.textContent = 'Thanks, your message is on its way. I will reply within 24 hours.';
    } catch (err) {
      status.className = 'form__status err';
      status.innerHTML = 'Could not send right now. Email me directly at <a href="mailto:mohamedmouhimine@gmail.com">mohamedmouhimine@gmail.com</a>.';
    } finally {
      btn.disabled = false; btn.textContent = 'Send message';
    }
  });
})();
