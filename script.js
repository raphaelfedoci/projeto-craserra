(function () {
  'use strict';

  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };
  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  function localDateString(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function addMediaListener(query, callback) {
    if (query.addEventListener) query.addEventListener('change', callback);
    else if (query.addListener) query.addListener(callback);
  }

  // Navbar: changes appearance only after the page starts scrolling.
  var nav = $('#nav');
  if (nav) {
    function updateNav() {
      nav.classList.toggle('solid', window.scrollY > 8);
    }
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  // Reveal-on-scroll, with a fallback for older browsers.
  var revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (element) { revealObserver.observe(element); });
  } else {
    revealItems.forEach(function (element) { element.classList.add('in'); });
  }

  // Gallery lightbox.
  var lightbox = $('#lb');
  var lightboxImage = $('#li');
  var lightboxCaption = $('#lc');
  var galleryItems = [];
  var galleryIndex = 0;
  var previousFocus = null;

  function renderLightbox() {
    if (!galleryItems.length || !lightboxImage) return;
    var current = galleryItems[galleryIndex];
    lightboxImage.src = current.currentSrc || current.src;
    lightboxImage.alt = current.alt || 'Foto ampliada';
    if (lightboxCaption) {
      lightboxCaption.textContent =
        (current.alt || 'Foto') + ' · ' + (galleryIndex + 1) + '/' + galleryItems.length;
    }
  }

  function openLightbox(image) {
    if (!lightbox) return;
    galleryItems = $$('img[data-g="' + image.dataset.g + '"]');
    galleryIndex = galleryItems.indexOf(image);
    if (galleryIndex < 0) return;
    previousFocus = document.activeElement;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lock');
    var closeButton = $('#lx');
    if (closeButton) closeButton.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lock');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }

  function stepLightbox(direction) {
    if (!galleryItems.length) return;
    galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
    renderLightbox();
  }

  $$('img[data-g]').forEach(function (image) {
    var clickable = image.closest('figure, .tile, .xcard');
    if (!clickable || image.closest('[hidden]')) return;
    clickable.addEventListener('click', function () { openLightbox(image); });
    clickable.style.cursor = 'zoom-in';
  });

  var closeLightboxButton = $('#lx');
  var previousImageButton = $('#lp');
  var nextImageButton = $('#ln');
  if (closeLightboxButton) closeLightboxButton.addEventListener('click', closeLightbox);
  if (previousImageButton) previousImageButton.addEventListener('click', function () { stepLightbox(-1); });
  if (nextImageButton) nextImageButton.addEventListener('click', function () { stepLightbox(1); });
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.setAttribute('aria-hidden', 'true');
  }

  // Reservation simulator. Prices are per accommodation, per night.
  var checkin = $('#ent');
  var checkout = $('#sai');
  var room = $('#qto');
  var guests = $('#hosp');
  var guestName = $('#nome');
  var summary = $('#resumo');
  var totalValue = $('#valor');
  var mailLink = $('#mailto');
  var feedback = $('#ok');
  var sendButton = $('#enviar');

  function setFeedback(message, isError) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove('hide');
    feedback.setAttribute('role', isError ? 'alert' : 'status');
  }

  if (checkin && checkout && room && guests && summary && totalValue) {
    var today = localDateString(new Date());
    checkin.min = today;
    checkout.min = today;

    function calculateReservation() {
      var arrival = checkin.value;
      var departure = checkout.value;
      var numberOfGuests = Number(guests.value);
      var nightlyRate = Number(room.value);

      if (!arrival || !departure) {
        summary.textContent = 'Escolha as datas para ver o valor.';
        totalValue.textContent = 'R$ 0';
        return null;
      }

      // ISO date strings are converted to UTC midnight to avoid DST/local timezone drift.
      if (arrival < today) {
        summary.textContent = 'O check-in não pode ser uma data passada.';
        totalValue.textContent = 'R$ 0';
        return null;
      }

      var start = Date.parse(arrival + 'T00:00:00Z');
      var end = Date.parse(departure + 'T00:00:00Z');
      var nights = Math.round((end - start) / 86400000);

      if (!Number.isFinite(nights) || nights < 1) {
        summary.textContent = 'O check-out deve ser pelo menos um dia após o check-in.';
        totalValue.textContent = 'R$ 0';
        return null;
      }

      if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > 5) {
        summary.textContent = 'Informe uma quantidade de hóspedes entre 1 e 5.';
        totalValue.textContent = 'R$ 0';
        return null;
      }

      if (!Number.isFinite(nightlyRate) || nightlyRate <= 0) {
        summary.textContent = 'Selecione uma acomodação válida.';
        totalValue.textContent = 'R$ 0';
        return null;
      }

      var total = nights * nightlyRate;
      summary.textContent =
        nights + (nights === 1 ? ' noite' : ' noites') + ' · ' +
        numberOfGuests + (numberOfGuests === 1 ? ' hóspede' : ' hóspedes') +
        ' · pensão completa inclusa';
      totalValue.textContent = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
      });
      return { nights: nights, total: total, guests: numberOfGuests };
    }

    function updateCheckoutMinimum() {
      if (!checkin.value) {
        checkout.min = today;
        return;
      }
      var minDeparture = new Date(checkin.value + 'T00:00:00');
      minDeparture.setDate(minDeparture.getDate() + 1);
      checkout.min = localDateString(minDeparture);
      if (checkout.value && checkout.value < checkout.min) checkout.value = '';
    }

    function buildMailto() {
      if (!mailLink) return;
      var selectedRoom = room.options[room.selectedIndex];
      var message = [
        'Olá! Gostaria de solicitar uma reserva no Craserra Campestre.',
        '',
        'Nome: ' + (guestName && guestName.value.trim() ? guestName.value.trim() : '(não informado)'),
        'Check-in: ' + (checkin.value ? checkin.value.split('-').reverse().join('/') : '(a definir)'),
        'Check-out: ' + (checkout.value ? checkout.value.split('-').reverse().join('/') : '(a definir)'),
        'Acomodação: ' + (selectedRoom ? selectedRoom.text.split(' · ')[0] : '(não selecionada)'),
        'Hóspedes: ' + guests.value,
        'Pensão completa inclusa na diária.'
      ].join('\n');

      mailLink.href = 'mailto:craserra.friburgo@gmail.com?subject=' +
        encodeURIComponent('Solicitação de reserva - Craserra Campestre') +
        '&body=' + encodeURIComponent(message);
    }

    [checkin, checkout, room, guests].forEach(function (field) {
      field.addEventListener('input', function () {
        if (field === checkin) updateCheckoutMinimum();
        calculateReservation();
        buildMailto();
        if (feedback) feedback.classList.add('hide');
      });
      field.addEventListener('change', function () {
        if (field === checkin) updateCheckoutMinimum();
        calculateReservation();
        buildMailto();
      });
    });

    if (guestName) {
      guestName.addEventListener('input', function () {
        guestName.setCustomValidity('');
        buildMailto();
        if (feedback) feedback.classList.add('hide');
      });
    }

    $$('[data-q]').forEach(function (link) {
      link.addEventListener('click', function () {
        room.value = link.dataset.q;
        calculateReservation();
        buildMailto();
      });
    });

    if (sendButton) {
      sendButton.addEventListener('click', function () {
        if (guestName && !guestName.value.trim()) {
          guestName.setCustomValidity('Informe seu nome para continuar.');
          guestName.reportValidity();
          guestName.focus();
          return;
        }
        if (guestName) guestName.setCustomValidity('');

        var result = calculateReservation();
        if (!result) {
          setFeedback('Confira as datas, a acomodação e a quantidade de hóspedes antes de continuar.', true);
          return;
        }

        buildMailto();
        setFeedback(
          'Sua solicitação está pronta. Se o aplicativo de e-mail não abrir automaticamente, use o endereço de contato abaixo para enviá-la.',
          false
        );

        if (mailLink && mailLink.href) {
          window.location.href = mailLink.href;
        }
      });
    }

    updateCheckoutMinimum();
    calculateReservation();
    buildMailto();
  }

  // Off-canvas navigation.
  var burger = $('#burger');
  var drawer = $('#drawer');
  var overlay = $('#ov');
  var closeDrawerButton = $('#dx');
  var drawerNav = $('#dnav');
  var lastDrawerFocus = null;
  var desktopQuery = window.matchMedia
    ? window.matchMedia('(min-width: 1121px)')
    : { matches: false };

  var navLinks = $$('#links a:not(.btn)');
  if (drawerNav && !drawerNav.children.length) {
    navLinks.forEach(function (link) {
      drawerNav.appendChild(link.cloneNode(true));
    });
  }

  var navLogo = $('#nlogo');
  var drawerLogo = $('#dlogo');
  if (navLogo && drawerLogo) drawerLogo.src = navLogo.currentSrc || navLogo.src;

  function openDrawer() {
    if (!drawer || !overlay || !burger) return;
    lastDrawerFocus = document.activeElement;
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('lock');
    if (closeDrawerButton) closeDrawerButton.focus();
  }

  function closeDrawer(restoreFocus) {
    if (!drawer || !overlay || !drawer.classList.contains('open')) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('lock');
    if (restoreFocus !== false) {
      if (lastDrawerFocus && lastDrawerFocus.focus) lastDrawerFocus.focus();
      else if (burger) burger.focus();
    }
  }

  if (burger) burger.addEventListener('click', openDrawer);
  if (closeDrawerButton) closeDrawerButton.addEventListener('click', function () { closeDrawer(); });
  if (overlay) overlay.addEventListener('click', function () { closeDrawer(); });

  document.addEventListener('click', function (event) {
    var anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    var targetId = anchor.getAttribute('href').slice(1);
    var target = targetId && document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    if (drawer && drawer.classList.contains('open')) closeDrawer(false);

    window.requestAnimationFrame(function () {
      target.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + targetId);
      }
    });
  });

  document.addEventListener('keydown', function (event) {
    if (lightbox && lightbox.classList.contains('open')) {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') stepLightbox(1);
      if (event.key === 'ArrowLeft') stepLightbox(-1);
      return;
    }

    if (!drawer || !drawer.classList.contains('open')) return;
    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }
    if (event.key === 'Tab') {
      var focusable = $$('#drawer a, #drawer button').filter(function (element) {
        return !element.disabled && element.offsetParent !== null;
      });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  addMediaListener(desktopQuery, function (event) {
    if (event.matches) closeDrawer(false);
  });

  // GSAP testimonial carousel, with a CSS/JS fallback if the CDN is unavailable.
  (function initTestimonials() {
    var track = $('#track');
    var viewport = $('#vp');
    var carousel = $('#car');
    var dots = $('#dots');
    var pauseButton = $('#pp');
    var previousButton = $('#prev');
    var nextButton = $('#next');
    if (!track || !viewport || !carousel || !dots || !pauseButton || !previousButton || !nextButton) return;

    var slides = $$('.slide', track);
    var count = slides.length;
    if (!count) return;

    var desktopCarouselQuery = window.matchMedia
      ? window.matchMedia('(min-width: 900px)')
      : { matches: false };
    var current = 0;
    var timer = null;
    var resumeTimer = null;
    var hovering = false;
    var manuallyPaused = !!reduceMotion.matches;
    var gap = 18;

    function visibleCount() {
      return desktopCarouselQuery.matches ? 2 : 1;
    }

    function maxIndex() {
      return Math.max(0, count - visibleCount());
    }

    function slideDistance() {
      return slides[0].getBoundingClientRect().width + gap;
    }

    function renderDots() {
      dots.innerHTML = '';
      for (var index = 0; index <= maxIndex(); index += 1) {
        (function (dotIndex) {
          var button = document.createElement('button');
          button.type = 'button';
          button.setAttribute('aria-label', 'Ir para a posição ' + (dotIndex + 1));
          button.addEventListener('click', function () {
            manuallyPaused = true;
            goTo(dotIndex);
            syncAutoplay();
          });
          dots.appendChild(button);
        })(index);
      }
    }

    function updateAccessibleSlides() {
      Array.prototype.forEach.call(dots.children, function (button, index) {
        if (index === current) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      slides.forEach(function (slide, index) {
        slide.setAttribute(
          'aria-hidden',
          index >= current && index < current + visibleCount() ? 'false' : 'true'
        );
      });
    }

    function goTo(index, instant) {
      current = index > maxIndex() ? 0 : (index < 0 ? maxIndex() : index);
      updateAccessibleSlides();

      var x = -(current * slideDistance());
      if (window.gsap && !reduceMotion.matches) {
        if (instant) window.gsap.set(track, { x: x });
        else window.gsap.to(track, {
          x: x,
          duration: 0.7,
          ease: 'power3.inOut',
          overwrite: true
        });
        if (!instant) {
          window.gsap.fromTo(slides.slice(current, current + visibleCount()),
            { opacity: 0.65, scale: 0.985 },
            { opacity: 1, scale: 1, duration: 0.55, stagger: 0.06, overwrite: 'auto' }
          );
        }
      } else {
        track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
      }
    }

    function syncAutoplay() {
      window.clearInterval(timer);
      var shouldPlay = !manuallyPaused && !hovering && !reduceMotion.matches && count > visibleCount();
      track.setAttribute('aria-live', shouldPlay ? 'off' : 'polite');
      pauseButton.textContent = manuallyPaused ? '▶' : '❚❚';
      pauseButton.setAttribute(
        'aria-label',
        manuallyPaused ? 'Retomar rotação automática' : 'Pausar rotação automática'
      );
      if (shouldPlay) {
        timer = window.setInterval(function () {
          if (!document.hidden) goTo(current + 1);
        }, 5500);
      }
    }

    previousButton.addEventListener('click', function () {
      goTo(current - 1);
      syncAutoplay();
    });
    nextButton.addEventListener('click', function () {
      goTo(current + 1);
      syncAutoplay();
    });
    pauseButton.addEventListener('click', function () {
      manuallyPaused = !manuallyPaused;
      syncAutoplay();
    });

    function pauseForInteraction() {
      hovering = true;
      syncAutoplay();
    }
    function resumeAfterInteraction(delay) {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        hovering = false;
        syncAutoplay();
      }, delay || 0);
    }

    carousel.addEventListener('mouseenter', pauseForInteraction);
    carousel.addEventListener('mouseleave', function () { resumeAfterInteraction(250); });
    carousel.addEventListener('focusin', pauseForInteraction);
    carousel.addEventListener('focusout', function () { resumeAfterInteraction(250); });
    carousel.addEventListener('touchstart', pauseForInteraction, { passive: true });
    carousel.addEventListener('touchend', function () { resumeAfterInteraction(4500); }, { passive: true });

    var pointerStart = null;
    viewport.addEventListener('pointerdown', function (event) {
      pointerStart = event.clientX;
    });
    viewport.addEventListener('pointerup', function (event) {
      if (pointerStart === null) return;
      var delta = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(delta) > 45) {
        goTo(delta < 0 ? current + 1 : current - 1);
        syncAutoplay();
      }
    });
    viewport.addEventListener('pointercancel', function () { pointerStart = null; });

    carousel.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') {
        goTo(current + 1);
        syncAutoplay();
      } else if (event.key === 'ArrowLeft') {
        goTo(current - 1);
        syncAutoplay();
      }
    });

    addMediaListener(desktopCarouselQuery, function () {
      current = Math.min(current, maxIndex());
      renderDots();
      goTo(current, true);
      syncAutoplay();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        goTo(current, true);
      }, 120);
    });

    renderDots();
    goTo(0, true);
    syncAutoplay();
  })();
})();
