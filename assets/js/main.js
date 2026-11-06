(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  $('#theme')?.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  /* ---------- "Try my job" evaluation tasks ---------- */
  const TASKS = [
    {
      lang: 'en', dir: 'ltr',
      prompt: 'Customer: "Can I cancel my annual plan and get a refund? I bought it 20 days ago." Policy: refunds within 14 days of purchase.',
      gloss: '',
      a: '"Yes, you can cancel anytime and get a full refund."',
      b: '"You can cancel anytime, but refunds only apply in the first 14 days, so at 20 days there\'s no refund. You keep access until the plan ends."',
      best: 'B',
      rubric: [['Factual accuracy', 1, 5], ['Follows the policy', 1, 5], ['Helpfulness', 3, 4]],
      why: 'A promises a refund the policy rules out, which would cost the company money and trust. B states the rule and tells the customer what happens next.'
    },
    {
      lang: 'fr', dir: 'ltr',
      prompt: 'Résume ce rapport en une phrase : « Le chiffre d\'affaires a augmenté de 12 % en 2025, principalement grâce aux ventes en ligne, tandis que les coûts logistiques ont progressé de 4 %. »',
      gloss: 'Summarise this report in one sentence: revenue up 12% in 2025, mainly from online sales, while logistics costs rose 4%.',
      a: '« En 2025, le chiffre d\'affaires a progressé de 12 %, porté par les ventes en ligne, malgré une hausse de 4 % des coûts logistiques. »',
      b: '« Le chiffre d\'affaires a doublé en 2025 grâce à l\'essor des ventes en magasin. »',
      best: 'A',
      rubric: [['Factual accuracy', 5, 1], ['One sentence', 5, 5], ['Completeness', 5, 2]],
      why: 'B reads well but invents a figure ("doubled") and the wrong sales channel (in-store). A keeps both numbers and stays in one sentence. Fluent hallucinations like B are the ones that slip past reviewers.'
    },
    {
      lang: 'ar', dir: 'rtl',
      prompt: 'اكتب ردًا مهذبًا ومختصرًا (جملتان كحدٍّ أقصى) على عميل يشتكي من تأخر طلبه.',
      gloss: 'Write a polite, short reply (two sentences max) to a customer complaining that their order is late.',
      a: 'نعتذر بصدق عن تأخر طلبك. سنتابع الأمر مع شركة الشحن ونرسل لك تحديثًا اليوم.',
      b: 'نتفهّم إحباطك تمامًا، فالتأخير أمر شائع في هذا الموسم بسبب الضغط الكبير على شركات الشحن. نرجو منك الانتظار بصبر. وإذا لم يصل الطلب خلال أسبوعين، يمكنك التواصل معنا مرة أخرى.',
      best: 'A',
      rubric: [['Two sentences max', 5, 1], ['Tone', 5, 2], ['Clear next step', 5, 2]],
      why: 'B runs to three sentences, blames the season and asks the customer to wait two weeks. A apologises and commits to an update today.'
    }
  ];

  const judge = $('#judge');
  if (judge) {
    const els = {
      promptText: $('#j-prompt-text'), a: $('#j-a'), b: $('#j-b'), agree: $('#j-agree'), rubric: $('#j-rubric'),
      why: $('#j-why'), msg: $('#j-msg'), next: $('#j-next'), dots: $$('.dots i', judge), langs: $$('[data-lang]', judge)
    };
    const picks = Array(TASKS.length).fill(null);
    let cur = 0;
    const check = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    const info = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';
    const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function setText(btn, text, t) {
      const span = $('.txt', btn);
      span.textContent = text;
      span.lang = t.lang; span.dir = t.dir;
      span.style.display = 'block';
    }

    function render(i) {
      cur = i;
      const t = TASKS[i];
      els.promptText.innerHTML = `<span lang="${t.lang}" dir="${t.dir}" style="display:block">${esc(t.prompt)}</span>` +
        (t.gloss ? `<span style="display:block;margin-top:6px;font-size:13px;color:var(--muted)">EN: ${esc(t.gloss)}</span>` : '');
      setText(els.a, t.a, t); setText(els.b, t.b, t);
      els.langs.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      els.dots.forEach((d, j) => {
        d.className = picks[j] === null ? '' : (picks[j] === TASKS[j].best ? 'on' : 'miss');
        if (j === i) d.classList.add('cur');
      });
      if (picks[i] === null) {
        judge.classList.remove('done');
        [els.a, els.b].forEach(b => { b.classList.remove('win', 'lose'); b.disabled = false; });
        els.msg.textContent = `Task ${i + 1} of ${TASKS.length}`;
        els.next.hidden = true;
      } else {
        reveal(picks[i]);
      }
    }

    function reveal(pick) {
      const t = TASKS[cur];
      const agreed = pick === t.best;
      judge.classList.add('done');
      els.a.classList.toggle('win', t.best === 'A'); els.a.classList.toggle('lose', t.best !== 'A');
      els.b.classList.toggle('win', t.best === 'B'); els.b.classList.toggle('lose', t.best !== 'B');
      els.a.disabled = els.b.disabled = true;
      els.agree.className = 'agree ' + (agreed ? 'yes' : 'no');
      els.agree.innerHTML = agreed
        ? `${check}<span><strong>We agree, ${t.best} is better.</strong> Here's how I scored it.</span>`
        : `${info}<span><strong>I picked ${t.best}.</strong> Close calls are exactly why teams pay for written rationales.</span>`;
      els.rubric.innerHTML = t.rubric.map(([c, a, b]) => {
        const cls = (v) => (v >= 4 ? 'hi' : v <= 2 ? 'lo' : '');
        return `<tr><td>${c}</td><td class="${cls(a)}">${a}/5</td><td class="${cls(b)}">${b}/5</td></tr>`;
      }).join('');
      els.why.innerHTML = `<strong>Rationale:</strong> ${esc(t.why)}`;
      els.dots[cur].className = (agreed ? 'on' : 'miss') + ' cur';

      const done = picks.filter(p => p !== null).length;
      const remaining = picks.findIndex(p => p === null);
      els.next.hidden = false;
      if (remaining === -1) {
        const score = picks.filter((p, j) => p === TASKS[j].best).length;
        els.msg.textContent = `You matched me on ${score} of ${TASKS.length}.`;
        els.next.textContent = 'Book a pilot';
        els.next.dataset.go = 'contact';
      } else {
        els.msg.textContent = `${done} of ${TASKS.length} done`;
        els.next.textContent = 'Next task →';
        els.next.dataset.go = String(remaining);
      }
    }

    [els.a, els.b].forEach(btn => btn.addEventListener('click', () => {
      if (picks[cur] !== null) return;
      picks[cur] = btn.dataset.pick;
      reveal(picks[cur]);
      els.next.focus({ preventScroll: true });
    }));
    els.next.addEventListener('click', () => {
      const go = els.next.dataset.go;
      if (go === 'contact') { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); return; }
      render(Number(go));
      if (judge.getBoundingClientRect().top < 0) judge.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    els.langs.forEach((b, j) => b.addEventListener('click', () => render(j)));
    render(0);
  }

  /* ---------- Active section in nav and tab bar ---------- */
  const navLinks = $$('.top nav a, .tabbar a');
  const ids = ['home', 'services', 'experience', 'work', 'about', 'contact'];
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ids.forEach(id => { const s = document.getElementById(id); if (s) secObs.observe(s); });

  /* ---------- Chart bars grow when scrolled into view ---------- */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const charts = $$('.chart');
    const chartObs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('anim'); chartObs.unobserve(en.target); } });
    }, { threshold: .6 });
    charts.forEach(c => chartObs.observe(c));
  }

  /* ---------- Year ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Copy email ---------- */
  const copyBtn = $('#copy'), email = $('#email');
  copyBtn?.addEventListener('click', () => {
    const flash = (m) => { copyBtn.textContent = m; setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(email); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText(email.textContent.trim()).then(() => flash('Copied'), () => { select(); flash('Selected'); }); }
    catch (e) { select(); flash('Selected'); }
  });

  /* ---------- Contact form (FormSubmit AJAX; plain POST without JS) ---------- */
  const form = $('#form'), status = $('#status');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { status.className = 'status err'; status.textContent = 'Add your name, a valid email and a few details about the project.'; return; }
    $('#f-langs').value = $$('.lang:checked', form).map(c => c.value).join(', ') || 'Not specified';

    const btn = $('button[type="submit"]', form);
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
