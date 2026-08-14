/* ==========================================================================
   TapItX.com - Main Application JavaScript
   Bi-Directional Reversible Scroll Motion & Physics Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticlesCanvas();
  initBiDirectionalScrollReveals();
  initScrollProgressBar();
  initPhone3DTilt();
  initNavbarScroll();
  initTapDemo();
  initEarningCalculator();
  initFAQAccordion();
  initModalHandlers();
});

/* --------------------------------------------------------------------------
   1. Subtly Animated Background Canvas Particles & Parallax Spotlight
   -------------------------------------------------------------------------- */
function initParticlesCanvas() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      color: Math.random() > 0.35 ? 'rgba(245, 224, 179, ' : 'rgba(0, 240, 255, ',
      alpha: Math.random() * 0.45 + 0.15,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.15,
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* --------------------------------------------------------------------------
   2. Scroll Progress Bar & Background Parallax
   -------------------------------------------------------------------------- */
function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  const spotlight = document.querySelector('.bg-spotlight-top');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;

    if (bar) bar.style.width = `${progress}%`;

    if (spotlight) {
      spotlight.style.transform = `translateX(-50%) translateY(${scrollTop * 0.25}px)`;
    }
  });
}

/* --------------------------------------------------------------------------
   3. BI-DIRECTIONAL REVERSIBLE SCROLL MOTION SYSTEM
      Animates IN when scrolling DOWN, Reverses OUT when scrolling UP!
   -------------------------------------------------------------------------- */
function initBiDirectionalScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');

  const checkReveals = () => {
    const windowHeight = window.innerHeight;

    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;

      // Element is visible in viewport
      if (elementTop < windowHeight * 0.92 && elementBottom > windowHeight * 0.08) {
        el.classList.add('active');
      } else {
        // Reverses OUT when scrolling away (UP or DOWN beyond view)!
        el.classList.remove('active');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          // Reverse animation when leaving view!
          entry.target.classList.remove('active');
        }
      });
    },
    { threshold: [0, 0.15, 0.5], rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));

  window.addEventListener('scroll', checkReveals);
  checkReveals(); // Trigger immediately for elements currently in view
}

/* --------------------------------------------------------------------------
   4. 3D Gyroscope/Tilt Physics on Native Smartphone Showcase Frame
   -------------------------------------------------------------------------- */
function initPhone3DTilt() {
  const phoneWrapper = document.querySelector('.native-phone-mockup');
  if (!phoneWrapper) return;

  const container = document.querySelector('.hero-visual');

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / rect.height) * 18;
    const rotateY = (x / rect.width) * 18;

    phoneWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  container.addEventListener('mouseleave', () => {
    phoneWrapper.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  });
}

/* --------------------------------------------------------------------------
   5. Navbar Scroll Blur Effect
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* --------------------------------------------------------------------------
   6. Playable Tap-to-Earn Web Demo Logic
   -------------------------------------------------------------------------- */
let tapScore = 0;
let tapCombo = 1;
let lastTapTime = 0;

function initTapDemo() {
  const orbBtn = document.getElementById('tapOrbBtn');
  const scoreVal = document.getElementById('tapScoreVal');
  const multiplierVal = document.getElementById('tapMultiplierVal');
  const particleContainer = document.getElementById('particleContainer');

  if (!orbBtn || !scoreVal) return;

  orbBtn.addEventListener('click', (e) => {
    const now = Date.now();

    if (now - lastTapTime < 450) {
      tapCombo = Math.min(tapCombo + 1, 5);
    } else {
      tapCombo = 1;
    }
    lastTapTime = now;

    tapScore += tapCombo;

    scoreVal.textContent = tapScore.toLocaleString();

    multiplierVal.textContent = `${tapCombo}x MULTIPLIER`;

    spawnFloatingCoin(e, orbBtn, particleContainer, tapCombo);

    if (tapScore >= 20 && !window.hasTriggeredDemoReward) {
      window.hasTriggeredDemoReward = true;
      setTimeout(() => {
        showRewardModal();
      }, 300);
    }
  });
}

function spawnFloatingCoin(e, parentBtn, container, combo) {
  const rect = parentBtn.getBoundingClientRect();
  const particle = document.createElement('div');
  particle.className = 'floating-coin-particle';
  particle.textContent = combo > 1 ? `+${combo}` : `+1`;

  const x = e.clientX - rect.left - 20;
  const y = e.clientY - rect.top - 20;

  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  container.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 750);
}

/* --------------------------------------------------------------------------
   7. Earning Calculator Logic (Nepalese Rupees NPR / Rs.)
   -------------------------------------------------------------------------- */
function initEarningCalculator() {
  const slider = document.getElementById('playtimeSlider');
  const playtimeVal = document.getElementById('playtimeVal');
  const dailyRes = document.getElementById('dailyRewardVal');
  const weeklyRes = document.getElementById('weeklyRewardVal');
  const monthlyRes = document.getElementById('monthlyRewardVal');

  if (!slider || !playtimeVal) return;

  const updateCalc = () => {
    const mins = parseInt(slider.value, 10);
    playtimeVal.textContent = `${mins} Mins/Day`;

    const dailyNPR = mins * 12;
    const weeklyNPR = dailyNPR * 7;
    const monthlyNPR = dailyNPR * 30;

    dailyRes.textContent = `Rs. ${dailyNPR.toLocaleString()}`;
    weeklyRes.textContent = `Rs. ${weeklyNPR.toLocaleString()}`;
    monthlyRes.textContent = `Rs. ${monthlyNPR.toLocaleString()}`;
  };

  slider.addEventListener('input', updateCalc);
  updateCalc();
}

/* --------------------------------------------------------------------------
   8. FAQ Accordion Handler
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-card');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-q');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach((other) => other.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   9. Modal Handlers
   -------------------------------------------------------------------------- */
function showRewardModal() {
  const modal = document.getElementById('rewardModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function initModalHandlers() {
  const modal = document.getElementById('rewardModal');
  const closeBtns = document.querySelectorAll('.close-modal');

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

/* Download APK Helper */
function downloadAPK() {
  alert("Downloading TapIt Official APK (v1.4.2)... Thank you for choosing TapIt!");
}
