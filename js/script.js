(function () {
      var $ = function (s) { return document.querySelector(s) }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)) };
      var nav = $('#nav'); function sc() { nav.classList.toggle('solid', window.scrollY > 0) } sc(); addEventListener('scroll', sc, { passive: true });
      // reveal
      var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }) }, { threshold: .12 }) : null;
      $$('.reveal').forEach(function (el) { io ? io.observe(el) : el.classList.add('in') });
      // lightbox
      var lb = $('#lb'), li = $('#li'), lc = $('#lc'), list = [], ix = 0;
      function show() { li.src = list[ix].src; li.alt = list[ix].alt; lc.textContent = list[ix].alt + ' · ' + (ix + 1) + '/' + list.length }
      function open(img) { list = $$('img[data-g="' + img.dataset.g + '"]'); ix = list.indexOf(img); show(); lb.classList.add('open'); document.body.style.overflow = 'hidden' }
      function close() { lb.classList.remove('open'); document.body.style.overflow = '' }
      function step(d) { ix = (ix + d + list.length) % list.length; show() }
      $$('img[data-g]').forEach(function (im) { var h = im.closest('figure,.tile,.xcard'); if (h && !h.closest('[hidden]')) { h.addEventListener('click', function () { open(im) }) } });
      $('#lx').onclick = close; $('#lp').onclick = function () { step(-1) }; $('#ln').onclick = function () { step(1) };
      lb.addEventListener('click', function (e) { if (e.target === lb) close() });
      addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) });
      // reserva
      var hoje = new Date().toISOString().slice(0, 10); $('#ent').min = hoje; $('#sai').min = hoje;
      function calc() {
        var e = $('#ent').value, s = $('#sai').value, r = $('#resumo'), v = $('#valor');
        if (!e || !s) { r.textContent = 'Escolha as datas para ver o valor.'; v.textContent = 'R$ 0'; return 0 }
        var n = Math.round((new Date(s) - new Date(e)) / 864e5);
        if (n < 1) { r.textContent = 'O check-out deve ser depois do check-in.'; v.textContent = 'R$ 0'; return 0 }
        var g = Math.max(1, +$('#hosp').value || 1), t = n * (+$('#qto').value);
        r.textContent = n + (n > 1 ? ' noites' : ' noite') + ' · ' + g + (g > 1 ? ' hóspedes' : ' hóspede') + ' · pensão completa inclusa';
        v.textContent = 'R$ ' + t.toLocaleString('pt-BR'); return t
      }
      ['ent', 'sai', 'qto', 'hosp'].forEach(function (id) { var el = document.getElementById(id); el.oninput = el.onchange = function () { if (id === 'ent' && el.value) { var d = new Date(el.value); d.setUTCDate(d.getUTCDate() + 1); $('#sai').min = d.toISOString().slice(0, 10) } calc(); up() } });
      $$('[data-q]').forEach(function (a) { a.addEventListener('click', function () { $('#qto').value = a.dataset.q; calc(); up() }) });
      function g(id) { return document.getElementById(id).value }
      function br(d) { return d ? d.split('-').reverse().join('/') : '(a definir)' }
      function up() {
        var q = $('#qto'), body = 'Olá! Gostaria de solicitar uma reserva no Craserra Campestre.\n\nNome: ' + g('nome').trim() + '\nCheck-in: ' + br(g('ent')) + '\nCheck-out: ' + br(g('sai')) + '\nAcomodação: ' + q.options[q.selectedIndex].text.split(' · ')[0] + '\nHóspedes: ' + g('hosp') + '\nPensão completa inclusa na diária.';
        $('#mailto').href = 'mailto:craserra.friburgo@gmail.com?subject=' + encodeURIComponent('Solicitação de reserva - Craserra Campestre') + '&body=' + encodeURIComponent(body)
      }
      $('#nome').addEventListener('input', up); up();
      $('#enviar').onclick = function () {
        var t = calc(), ok = $('#ok'); up(); ok.classList.remove('hide'); ok.textContent = '';
        if (!t) { ok.textContent = 'Selecione datas válidas para continuar.'; return }
        var n = g('nome').trim() || 'hóspede'; ok.appendChild(document.createTextNode('Obrigado, ' + n + '! 🌻 Valor estimado: R$ ' + t.toLocaleString('pt-BR') + '. Para finalizar, '));
        var a = document.createElement('a'); a.href = $('#mailto').href; a.textContent = 'envie a solicitação por e-mail'; ok.appendChild(a); ok.appendChild(document.createTextNode('.'))
      };

      // menu lateral (offcanvas) + rolagem suave
      var rmq = matchMedia('(prefers-reduced-motion:reduce)'), burger = $('#burger'), drawer = $('#drawer'), ov = $('#ov'), dx = $('#dx'), lastF = null;
      $('#dlogo').src = $('#nlogo').src;
      $$('#links a:not(.btn)').forEach(function (a) { var c = a.cloneNode(true); $('#dnav').appendChild(c) });
      function openD() { lastF = document.activeElement; drawer.classList.add('open'); ov.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('lock'); setTimeout(function () { dx.focus() }, 60) }
      function closeD(back) { if (!drawer.classList.contains('open')) return; drawer.classList.remove('open'); ov.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('lock'); if (back !== false) burger.focus() }
      burger.onclick = openD; dx.onclick = function () { closeD() }; ov.onclick = function () { closeD() };
      addEventListener('keydown', function (e) {
        if (!drawer.classList.contains('open')) return; if (e.key === 'Escape') { closeD(); return }
        if (e.key === 'Tab') { var f = $$('#drawer a,#drawer button'); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } }
      });
      matchMedia('(min-width:1121px)').addEventListener('change', function (e) { if (e.matches) closeD(false) });
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]'); if (!a) return; var id = a.getAttribute('href').slice(1), tg = id && document.getElementById(id); if (!tg) return; e.preventDefault(); closeD(false);
        requestAnimationFrame(function () { tg.scrollIntoView({ behavior: rmq.matches ? 'auto' : 'smooth', block: 'start' }); try { history.replaceState(null, '', '#' + id) } catch (_) { } })
      });
      // carrossel de depoimentos (GSAP)
      (function () {
        var track = $('#track'), vp = $('#vp'), car = $('#car'), dots = $('#dots'), pp = $('#pp'); if (!track) return;
        var slides = $$('#track .slide'), n = slides.length, mq = matchMedia('(min-width:900px)'), i = 0, timer = null, inter = false, user = rmq.matches, GAP = 18;
        function pv() { return mq.matches ? 2 : 1 } function mx() { return Math.max(0, n - pv()) }
        function build() { dots.innerHTML = ''; for (var k = 0; k <= mx(); k++)(function (k) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ir para a posição ' + (k + 1) + ' de ' + (mx() + 1)); b.onclick = function () { go(k); user = true; sync() }; dots.appendChild(b) })(k) }
        function mark() { [].forEach.call(dots.children, function (b, k) { k === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current') }); slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k >= i && k < i + pv() ? 'false' : 'true') }) }
        function go(k, instant) {
          i = k > mx() ? 0 : k < 0 ? mx() : k; mark(); var dx = -(i * (slides[0].offsetWidth + GAP));
          if (window.gsap && !instant && !rmq.matches) { gsap.to(track, { x: dx, duration: .75, ease: 'power3.inOut', overwrite: true }); gsap.fromTo(slides.slice(i, i + pv()), { opacity: .45, scale: .97 }, { opacity: 1, scale: 1, duration: .7, stagger: .08, ease: 'power2.out', overwrite: 'auto' }) }
          else if (window.gsap) { gsap.set(track, { x: dx }) } else { track.style.transform = 'translate3d(' + dx + 'px,0,0)' }
        }
        function sync() { clearInterval(timer); var play = !user && !inter && !rmq.matches; track.setAttribute('aria-live', play ? 'off' : 'polite'); pp.textContent = user ? '▶' : '❚❚'; pp.setAttribute('aria-label', user ? 'Retomar rotação automática' : 'Pausar rotação automática'); if (play) timer = setInterval(function () { if (!document.hidden) go(i + 1) }, 5500) }
        $('#prev').onclick = function () { go(i - 1); sync() }; $('#next').onclick = function () { go(i + 1); sync() };
        pp.onclick = function () { user = !user; sync() };
        var rt; function pause() { inter = true; clearTimeout(rt); sync() } function resume(d) { clearTimeout(rt); rt = setTimeout(function () { inter = false; sync() }, d || 0) }
        car.addEventListener('mouseenter', pause); car.addEventListener('mouseleave', function () { resume(300) });
        car.addEventListener('focusin', pause); car.addEventListener('focusout', function () { resume(300) });
        car.addEventListener('touchstart', pause, { passive: true }); car.addEventListener('touchend', function () { resume(6000) }, { passive: true });
        var sx = null; vp.addEventListener('pointerdown', function (e) { sx = e.clientX }); vp.addEventListener('pointerup', function (e) { if (sx === null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 50) { go(d < 0 ? i + 1 : i - 1); sync() } }); vp.addEventListener('pointercancel', function () { sx = null });
        car.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(i + 1); sync() } if (e.key === 'ArrowLeft') { go(i - 1); sync() } });
        mq.addEventListener('change', function () { build(); go(Math.min(i, mx()), true) });
        var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { go(i, true) }, 120) });
        build(); go(0, true); sync();
      })();
    })();