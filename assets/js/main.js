// ===========================
// Storage helper (global)
// ===========================
const Storage = {
  get(){ try{ return JSON.parse(localStorage.getItem('sr_user')) || null; }catch{ return null; }},
  set(v){ localStorage.setItem('sr_user', JSON.stringify(v)); },
  clear(){ localStorage.removeItem('sr_user'); }
};

// Se já estiver logado e abrir o login, vai pra home
(function ensureRoute(){
  const user = Storage.get();
  if (user && location.pathname.endsWith('/pages/login.html')) {
    location.replace('home.html');
  }
})();

// ===========================
// Transições simples de página
// ===========================
(function pageTransitions(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // entrada
  window.addEventListener('DOMContentLoaded', () => {
    if (prefersReduced) return;
    const root = document.querySelector('main') || document.body;
    root.classList.add('page-enter');
    root.addEventListener('animationend', () => {
      root.classList.remove('page-enter');
    }, { once: true });
  });

  // saída
  document.addEventListener('click', (e) => {
    if (prefersReduced) return;

    const a = e.target.closest('a');
    if (!a) return;

    // atalhos/teclas
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const href = a.getAttribute('href') || '';
    if (!href) return;

    // ignorar tipos especiais
    if (a.hasAttribute('download')) return;
    if (a.getAttribute('target') === '_blank') return;
    if (href.startsWith('#')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

    // link externo?
    const isExternal = /^https?:\/\//i.test(href) && !href.includes(location.host);
    if (isExternal) return;

    // link marcado p/ não animar
    if (a.dataset.noTransition !== undefined) return;

    // navegação interna válida → anima saída
    e.preventDefault();

    const root = document.querySelector('main') || document.body;
    root.classList.add('page-leave');

    let done = false;
    const go = () => { if (done) return; done = true; window.location = a.href; }; // usa HREF absoluto do <a>

    root.addEventListener('animationend', go, { once: true });
    setTimeout(go, 260); // fallback
  });
})();