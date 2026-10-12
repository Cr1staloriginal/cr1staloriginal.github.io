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

/* Live public GitHub profile data: no invented contribution numbers. */
(async function(){
 const stats=document.getElementById('github-stats'),note=document.getElementById('github-note');if(!stats)return;
 try{const r=await fetch('https://api.github.com/users/Cr1staloriginal',{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw Error('API unavailable');const p=await r.json();
 const rows=[[p.public_repos,'Репозитории'],[p.followers,'Подписчики'],[p.following,'Подписки']];
 stats.replaceChildren(...rows.map(([v,l])=>{const d=document.createElement('div'),n=document.createElement('strong'),s=document.createElement('span');n.textContent=Number(v).toLocaleString('ru-RU');s.textContent=l;d.append(n,s);return d;}));
 if(note)note.textContent='Данные загружены из публичного API GitHub.';
 }catch(e){if(note)note.textContent='Статистика временно недоступна. Профиль GitHub открыт по ссылке выше.';}
})();
const overlay=document.getElementById('terminal-overlay'),trigger=document.getElementById('terminal-trigger'),closeBtn=document.getElementById('terminal-close'),form=document.getElementById('terminal-form'),input=document.getElementById('terminal-input'),output=document.getElementById('terminal-output');
const commands={help:'Команды: help, about, stack, projects, contact, whoami, ls, pwd, date, clear, exit',about:'Я Cr1stalik — Python-разработчик, создаю ботов и веб-проекты.',stack:'Python · disnake · discord.py · aiogram · HTML · CSS · JavaScript · SQLite · Git',projects:'Fluffy, Developer Portfolio, Paw Art Studio, SongID.',contact:'GitHub: github.com/Cr1staloriginal · Telegram: @cr1staloriginal',whoami:'visitor — любопытный исследователь портфолио :)',ls:'about.md  projects/  stack.json  fluffy.html',pwd:'/home/cr1stalik/portfolio',date:new Date().toLocaleDateString('ru-RU',{year:'numeric',month:'long',day:'numeric'})};
function openTerm(){if(!overlay)return;overlay.hidden=false;setTimeout(()=>input&&input.focus(),20);}
function closeTerm(){if(!overlay)return;overlay.hidden=true;if(trigger)trigger.focus();}
function line(text,cls=''){const p=document.createElement('p');p.textContent=text;if(cls)p.className=cls;output.append(p);output.scrollTop=output.scrollHeight;}
if(trigger)trigger.addEventListener('click',openTerm);if(closeBtn)closeBtn.addEventListener('click',closeTerm);
if(overlay)overlay.addEventListener('click',e=>{if(e.target===overlay)closeTerm();});
if(form)form.addEventListener('submit',e=>{e.preventDefault();const c=(input.value||'').trim().toLowerCase();if(!c)return;line('visitor@cr1stalik:~$ '+c);input.value='';if(c==='clear'){output.replaceChildren();return;}if(c==='exit'){closeTerm();return;}if(commands[c])line(commands[c],'terminal-success');else line('Команда не найдена: '+c+'. Введи help.','terminal-error');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay&&!overlay.hidden)closeTerm();if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();if(overlay&&overlay.hidden)openTerm();else closeTerm();}});
const year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());


/* Discord avatar sync: JSON is public metadata; the bot token stays in GitHub Actions Secrets. */
(async function syncDiscordAvatar() {
  const images = document.querySelectorAll('[data-discord-avatar]');
  if (!images.length) return;

  try {
    const response = await fetch(`avatar-sync.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Avatar metadata is not available yet.');
    const profile = await response.json();
    if (typeof profile.avatar_url !== 'string' || !profile.avatar_url.trim()) return;

    images.forEach((image) => {
      image.addEventListener('error', () => {
        image.src = 'avatar.png';
      }, { once: true });
      image.src = profile.avatar_url;
    });
  } catch (error) {
    /* Keep the bundled avatar.png as a safe offline fallback. */
  }
})();
