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
const commands={help:'Команды: help, about, stack, projects, contact, whoami, ls, pwd, date, clear, exit',about:'Я Cr1stalik — Python-разработчик, создаю ботов и веб-проекты.',stack:'Python · disnake · discord.py · aiogram · HTML · CSS · JavaScript · SQLite · Git',projects:'Fluffy — мой Discord-бот; Cr1stalik Portfolio — мой сайт; Paw Art Studio — клиентский сайт, разработанный на заказ; SongID — экспериментальный веб-прототип.',contact:'GitHub: github.com/Cr1staloriginal · Telegram: @cr1staloriginal',whoami:'visitor — любопытный исследователь портфолио :)',ls:'about.md  projects/  stack.json  fluffy.html',pwd:'/home/cr1stalik/portfolio',date:new Date().toLocaleDateString('ru-RU',{year:'numeric',month:'long',day:'numeric'})};
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


/* Portfolio 3.0: public status feed and active project cards. */
(async function loadPublicStatus(){
 const status=document.getElementById('now-status'),focus=document.getElementById('now-focus');
 if(!status&&!focus)return;
 try{
  const response=await fetch('data/site-data.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Status unavailable');
  const data=await response.json();
  if(status){
   const indicator=document.createElement('span');indicator.className='now-indicator';
   const content=document.createElement('div');
   const title=document.createElement('strong');title.textContent=(data.status?.label||'Статус не указан')+(data.status?.state?' · '+data.status.state:'');
   const description=document.createElement('p');description.textContent=data.status?.description||'';
   content.append(title,description);status.replaceChildren(indicator,content);
  }
  if(focus){
   focus.replaceChildren();
   (Array.isArray(data.focus)?data.focus:[]).forEach(item=>{
    const card=document.createElement('article');card.className='now-focus-card';
    const kind=document.createElement('small');kind.textContent=item.kind||'Проект';
    const name=document.createElement('b');name.textContent=item.name||'Без названия';
    const state=document.createElement('span');state.textContent=item.state||'Статус не указан';
    card.append(kind,name,state);
    if(typeof item.url==='string'&&/^https:\/\//.test(item.url)){
     const link=document.createElement('a');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Открыть ↗';card.append(link);
    }
    focus.append(card);
   });
  }
 }catch(error){
  if(status)status.textContent='Статус временно недоступен. Актуальные ссылки доступны в профиле GitHub.';
  if(focus)focus.textContent='Не удалось загрузить список активных проектов.';
 }
})();

/* Extended public GitHub dashboard: repository cards and language byte totals. */
(async function loadRepositoryDashboard(){
 const list=document.getElementById('github-repositories'),languages=document.getElementById('github-languages');
 if(!list&&!languages)return;
 try{
  const response=await fetch('https://api.github.com/users/Cr1staloriginal/repos?sort=updated&per_page=6',{headers:{Accept:'application/vnd.github+json'}});
  if(!response.ok)throw new Error('GitHub API unavailable');
  const repos=await response.json();
  if(list){
   list.replaceChildren();
   repos.forEach(repo=>{
    const link=document.createElement('a');link.className='github-repo';link.href=repo.html_url;link.target='_blank';link.rel='noopener noreferrer';
    const info=document.createElement('span');const name=document.createElement('strong');name.textContent=repo.name;
    const desc=document.createElement('small');desc.textContent=repo.description||'Публичный репозиторий';
    info.append(name,desc);
    const meta=document.createElement('span');meta.className='github-repo-meta';meta.textContent='★ '+Number(repo.stargazers_count||0);
    link.append(info,meta);list.append(link);
   });
   if(!repos.length)list.textContent='Публичные репозитории не найдены.';
  }
  if(languages){
   const totals={};
   const languageResults=await Promise.all(repos.slice(0,6).map(async repo=>{
    try{const r=await fetch(repo.languages_url,{headers:{Accept:'application/vnd.github+json'}});return r.ok?await r.json():{};}catch(_){return {};}
   }));
   languageResults.forEach(result=>Object.entries(result).forEach(([name,bytes])=>{totals[name]=(totals[name]||0)+Number(bytes||0);}));
   const sorted=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);
   languages.replaceChildren();
   const total=sorted.reduce((sum,item)=>sum+item[1],0);
   if(!total){languages.textContent='GitHub пока не вернул данные о языках.';return;}
   sorted.forEach(([name,bytes])=>{
    const row=document.createElement('div');row.className='language-row';
    const label=document.createElement('span');label.textContent=name;
    const track=document.createElement('span');track.className='language-track';
    const fill=document.createElement('span');fill.className='language-fill';fill.style.display='block';fill.style.width=(bytes/total*100).toFixed(1)+'%';track.append(fill);
    const percent=document.createElement('span');percent.className='language-percent';percent.textContent=Math.round(bytes/total*100)+'%';
    row.append(label,track,percent);languages.append(row);
   });
  }
 }catch(error){
  if(list)list.textContent='Репозитории временно недоступны. Открой профиль GitHub по ссылке выше.';
  if(languages)languages.textContent='Статистика языков временно недоступна.';
 }
})();

/* Theme palette and particle preference are local to this visitor's browser. */
(function setupAppearance(){
 const trigger=document.getElementById('appearance-trigger'),panel=document.getElementById('appearance-panel');
 if(!trigger||!panel)return;
 const themeButtons=panel.querySelectorAll('[data-theme-choice]');
 const applyTheme=theme=>{
  const selected=['signature','violet','ocean'].includes(theme)?theme:'signature';
  document.body.dataset.theme=selected==='signature'?'':selected;
  try{localStorage.setItem('cr1stalik-theme',selected);}catch(_){}
  themeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===selected)));
 };
 let savedTheme='signature';try{savedTheme=localStorage.getItem('cr1stalik-theme')||'signature';}catch(_){}
 applyTheme(savedTheme);
 themeButtons.forEach(button=>button.addEventListener('click',()=>applyTheme(button.dataset.themeChoice)));
 trigger.addEventListener('click',()=>{
  panel.hidden=!panel.hidden;
  trigger.setAttribute('aria-expanded',String(!panel.hidden));
 });
 const particleButton=document.getElementById('particles-toggle'),particles=document.getElementById('particles-js');
 let particlesOn=true;try{particlesOn=localStorage.getItem('cr1stalik-particles')!=='off';}catch(_){}
 const applyParticles=()=>{
  if(particles)particles.style.display=particlesOn?'':'none';
  if(particleButton){particleButton.textContent='Частицы: '+(particlesOn?'вкл.':'выкл.');particleButton.setAttribute('aria-pressed',String(particlesOn));}
 };
 applyParticles();
 if(particleButton)particleButton.addEventListener('click',()=>{particlesOn=!particlesOn;try{localStorage.setItem('cr1stalik-particles',particlesOn?'on':'off');}catch(_){}applyParticles();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus();}});
})();

/* Subtle cursor spotlight on pointer devices only; no effect on touch screens. */
if(window.matchMedia('(pointer:fine)').matches&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 let queued=false,lastX=0,lastY=0;
 document.addEventListener('pointermove',event=>{
  lastX=event.clientX;lastY=event.clientY;
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{document.documentElement.style.setProperty('--pointer-x',lastX+'px');document.documentElement.style.setProperty('--pointer-y',lastY+'px');queued=false;});
 },{passive:true});
}

/* Extra terminal commands for the Portfolio 3.0 sections. */
Object.assign(commands,{
 help:'Команды: help, about, stack, projects, contact, whoami, ls, pwd, date, roadmap, github, status, updates, achievements, theme, matrix, clear, exit',
 roadmap:'Roadmap: roadmap.html — этапы развития и планы.',
 github:'GitHub Dashboard: публичные репозитории и языки загружаются из GitHub API.',
 status:'Текущий статус и активные проекты находятся в разделе «Сейчас в работе».',
 updates:'История обновлений и подтверждённые этапы: updates.html.',
 achievements:'Достижения показывают только реальные этапы, подтверждённые проектами.',
 theme:'Открой «Вид» внизу страницы, чтобы выбрать фирменную, Violet или Ocean палитру.',
 matrix:'01000011 01110010 01110001 01110011 01110100 01100001 01101100 01101001 01101011 — любопытство превращает идеи в код.'
});

/* Contact form prepares a Telegram draft; the visitor explicitly sends it in Telegram. */
(function setupContactForm(){
 const form=document.getElementById('contact-form');
 if(!form)return;
 const feedback=document.getElementById('contact-form-feedback');
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const name=(document.getElementById('contact-name')?.value||'').trim();
  const topic=document.getElementById('contact-topic')?.value||'Другое';
  const message=(document.getElementById('contact-message')?.value||'').trim();
  if(!name||!message){if(feedback)feedback.textContent='Заполни имя и сообщение.';return;}
  const draft='Привет! Меня зовут '+name+'.\nТема: '+topic+'.\n\n'+message;
  const url='https://t.me/cr1staloriginal?text='+encodeURIComponent(draft);
  if(feedback)feedback.textContent='Открываю Telegram с подготовленным черновиком. Проверь его и отправь вручную.';
  const opened=window.open(url,'_blank','noopener,noreferrer');
  if(!opened&&feedback)feedback.textContent='Если Telegram не открылся, используй контактную ссылку Telegram выше и скопируй своё сообщение.';
 });
})();
