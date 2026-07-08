/* =====================================================
   THE LETTER — Script
   Handles: ambient particles, screen flow, password check,
   cinematic transition, scroll reveals, progress bar, music.
   ===================================================== */

(() => {
  'use strict';

  /* ---------------------------------------------------
     CONFIG — change the password here whenever you like
     --------------------------------------------------- */
  const CONFIG = {
    password: 'twin',
    loadingDurationMs: 4200,      // how long the loading screen stays up
    transitionDurationMs: 5600,   // how long the two-line cinematic transition lasts
  };

  /* ---------------------------------------------------
     ELEMENT REFERENCES
     --------------------------------------------------- */
  const loadingScreen = document.getElementById('loading-screen');
  const passwordScreen = document.getElementById('password-screen');
  const passwordCard = document.getElementById('password-card');
  const passwordForm = document.getElementById('password-form');
  const passwordInput = document.getElementById('password-input');
  const deniedMessage = document.getElementById('denied-message');
  const transitionScreen = document.getElementById('transition-screen');
  const letterScreen = document.getElementById('letter-screen');
  const progressFill = document.getElementById('progress-fill');
  const musicToggle = document.getElementById('music-toggle');
  const musicSlash = document.getElementById('music-slash');
  const bgAudio = document.getElementById('bg-audio');
  const letterContainer = document.querySelector('.letter-container');
  const letterEnding = document.getElementById('letter-ending');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
     1. AMBIENT PARTICLE FIELD
     A soft field of floating embers/dust that runs behind
     every screen for atmosphere.
     ===================================================== */
  function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let width, height, particles;
    const PARTICLE_COUNT = window.innerWidth < 640 ? 34 : 60;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        speedY: Math.random() * 0.25 + 0.05,
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.5 + 0.1,
        flicker: Math.random() * 0.02 + 0.005,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += (Math.random() - 0.5) * p.flicker;
        p.opacity = Math.max(0.05, Math.min(0.65, p.opacity));

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 165, 116, ${p.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    if (!prefersReducedMotion) {
      draw();
    } else {
      // Draw a single static frame for reduced-motion users
      draw_static: {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 165, 116, ${p.opacity})`;
          ctx.fill();
        });
      }
    }

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  /* =====================================================
     2. SCREEN FLOW — loading -> password -> transition -> letter
     ===================================================== */
  function goToPasswordScreen() {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      passwordScreen.classList.remove('hidden');
      passwordInput.focus();
    }, 900); // matches the .screen opacity transition duration
  }

  function showDenied() {
    deniedMessage.classList.add('show');
    passwordCard.classList.remove('shake');
    // Force reflow so the shake animation can replay
    void passwordCard.offsetWidth;
    passwordCard.classList.add('shake');
    passwordInput.value = '';
    passwordInput.focus();
  }

  function handleCorrectPassword() {
    deniedMessage.classList.remove('show');
    passwordCard.classList.add('granted');

    setTimeout(() => {
      passwordScreen.classList.add('hidden');
      transitionScreen.classList.remove('hidden');

      setTimeout(() => {
        transitionScreen.classList.add('fade-out');
        setTimeout(() => {
          transitionScreen.classList.add('hidden');
          letterScreen.classList.remove('hidden');
          initScrollReveal();
          initProgressBar();
        }, 900);
      }, CONFIG.transitionDurationMs);
    }, 1100); // lets the granted glow animation play out first
  }

  function checkPassword(value) {
    return value.trim().toLowerCase() === CONFIG.password.trim().toLowerCase();
  }

  /* =====================================================
     3. PASSWORD FORM HANDLING
     ===================================================== */
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = passwordInput.value;
    if (checkPassword(value)) {
      handleCorrectPassword();
    } else {
      showDenied();
    }
  });

  /* =====================================================
     4. SCROLL REVEAL — paragraphs fade in as they enter view
     ===================================================== */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    // Ending sequence: when the final line enters view, focus fully on it
    const endingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            letterEnding.classList.add('in-view');
            letterContainer.classList.add('ending-focus');
          } else if (entry.boundingClientRect.top > 0) {
            // Scrolled back up above the ending — restore the letter
            letterEnding.classList.remove('in-view');
            letterContainer.classList.remove('ending-focus');
          }
        });
      },
      { threshold: 0.6 }
    );
    endingObserver.observe(letterEnding);
  }

  /* =====================================================
     5. READING PROGRESS BAR
     ===================================================== */
  function initProgressBar() {
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* =====================================================
     6. OPTIONAL AMBIENT MUSIC TOGGLE (off by default)
     Add a src to the <audio> element in index.html to enable.
     ===================================================== */
  let musicPlaying = false;
  musicToggle.addEventListener('click', () => {
    const hasSource = bgAudio.querySelector('source').getAttribute('src');
    if (!hasSource) {
      // No audio configured — gently indicate it's unavailable
      musicSlash.classList.add('active');
      setTimeout(() => musicSlash.classList.remove('active'), 900);
      return;
    }

    if (musicPlaying) {
      bgAudio.pause();
      musicSlash.classList.remove('active');
    } else {
      bgAudio.volume = 0.35;
      bgAudio.play().catch(() => {});
      musicSlash.classList.add('active');
    }
    musicPlaying = !musicPlaying;
  });

  /* =====================================================
     7. KEYBOARD SUPPORT
     Enter key already submits via the form; this adds a
     small extra affordance for clarity if focus is lost.
     ===================================================== */
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Enter' &&
      !passwordScreen.classList.contains('hidden') &&
      document.activeElement !== passwordInput
    ) {
      passwordForm.requestSubmit();
    }
  });

  /* =====================================================
     INIT
     ===================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    setTimeout(goToPasswordScreen, CONFIG.loadingDurationMs);
  });
})();
