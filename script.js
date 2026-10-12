const typingElement = document.getElementById('typing');
const phrases = ['Python Developer', 'Bot Developer', 'Web Developer'];
let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typePhrase() {
  if (!typingElement) return;
  const phrase = phrases[phraseIndex];
  typingElement.textContent = phrase.slice(0, characterIndex);
  let delay = deleting ? 45 : 85;

  if (!deleting && characterIndex < phrase.length) {
    characterIndex++;
  } else if (!deleting) {
    deleting = true;
    delay = 1350;
  } else if (characterIndex > 0) {
    characterIndex--;
  } else {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 280;
  }
  window.setTimeout(typePhrase, delay);
}
if (typingElement && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  typePhrase();
} else if (typingElement) {
  typingElement.textContent = phrases[0];
}

const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
if (menuToggle && siteNav) {
  const closeMenu = () => {
    siteNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  };
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });
  siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('active'));
}

const particlesLibraryReady = typeof window.particlesJS === 'function';
if (particlesLibraryReady && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.particlesJS('particles-js', {
    particles: {
      number: { value: window.innerWidth < 700 ? 28 : 48, density: { enable: true, value_area: 900 } },
      color: { value: '#9b8af5' },
      shape: { type: 'circle' },
      opacity: { value: 0.24, random: true },
      size: { value: 2, random: true },
      line_linked: { enable: true, distance: 135, color: '#8275d8', opacity: 0.12, width: 1 },
      move: { enable: true, speed: 0.65, direction: 'none', random: true, straight: false, out_mode: 'out' }
    },
    interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false }, resize: true } },
    retina_detect: true
  });
}
