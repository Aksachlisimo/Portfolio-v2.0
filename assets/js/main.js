(() => {
  // Year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Highlight the nav link for the section in view
  const links = new Map([...document.querySelectorAll('.nav ul a')].map(a => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      links.get(en.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) obs.observe(s); });

  // Copy email
  const copyBtn = document.getElementById('copy');
  const email = document.getElementById('email');
  copyBtn?.addEventListener('click', () => {
    const flash = (msg) => { copyBtn.textContent = msg; setTimeout(() => { copyBtn.textContent = 'Copy email'; }, 1800); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(email); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try {
      navigator.clipboard.writeText(email.textContent.trim()).then(() => flash('Copied'), () => { select(); flash('Selected'); });
    } catch (e) { select(); flash('Selected'); }
  });

  // Contact form via FormSubmit's AJAX endpoint. Without JS it falls back to a normal POST.
  const form = document.getElementById('form');
  const status = document.getElementById('status');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { status.className = 'status err'; status.textContent = 'Add your name, a valid email and a few details about the project.'; return; }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    status.className = 'status'; status.textContent = '';
    try {
      const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') throw new Error(data.message || 'Request failed');
      form.reset();
      status.className = 'status ok';
      status.textContent = 'Thanks, your details are on their way. I reply within one working day.';
    } catch (err) {
      status.className = 'status err';
      status.textContent = 'This didn\'t send. Email me directly at mohamedmouhimine@gmail.com.';
    } finally {
      btn.disabled = false; btn.textContent = 'Send project details';
    }
  });
})();
