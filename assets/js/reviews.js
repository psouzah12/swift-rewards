// reviews.js — guarda de rota robusta + render
(function(){
  const MAX_TRIES = 10;      // tenta por até ~500ms no total (10 * 50ms)
  const TRY_INTERVAL = 50;

  function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

  async function waitForStorage(){
    let tries = 0;
    while (tries < MAX_TRIES){
      if (window.Storage && typeof Storage.get === 'function') return true;
      tries++;
      await wait(TRY_INTERVAL);
    }
    return false;
  }

  async function getUserWithTolerance(){
    const ok = await waitForStorage();
    if (!ok){
      console.error('[reviews] main.js não carregou (Storage indisponível). Verifique ORDEM/CAMINHO dos scripts.');
      return null;
    }
    let u = Storage.get();
    if (u) return u;

    // re-tenta algumas vezes caso transição/parse atrasem
    for (let i = 0; i < 6; i++){
      await wait(60);
      u = Storage.get();
      if (u) return u;
    }
    return null;
  }

  function markGuardHop(){
    sessionStorage.setItem('sr_guard_hop', String(Date.now()));
  }
  function recentlyGuardHopped(){
    const t = Number(sessionStorage.getItem('sr_guard_hop') || 0);
    return t && (Date.now() - t) < 1500; // 1.5s
  }

  function makeStars(score){
    const s = Math.max(0, Math.min(10, Math.round(score)));
    const full = Math.round(s / 2); // 0..10 -> 0..5
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 5; i++){
      const icon = document.createElement('i');
      icon.className = i < full ? 'bi bi-star-fill' : 'bi bi-star';
      frag.appendChild(icon);
    }
    return frag;
  }

  // ----------------- bootstrap -----------------
  document.addEventListener('DOMContentLoaded', async () => {
    // 1) Guarda de rota tolerante
    const user = await getUserWithTolerance();
    if (!user){
      if (recentlyGuardHopped()){
        console.warn('[reviews] Evitando loop de redirecionamento.');
        return; // fica parado para não entrar em loop
      }
      markGuardHop();
      window.location.href = './login.html'; // relativo a /pages/
      return;
    }

    // 2) Dados mock
    const ALL_REVIEWS = [
      { score: 10, text: 'Fui muito bem atendido! O colaborador foi extremamente educado, paciente e me ajudou a escolher os melhores cortes.' },
      { score: 8,  text: 'Atendimento dentro do esperado. Foi bem simpático, mas não houve muito entusiasmo.' },
      { score: 10, text: 'Experiência excelente. O colaborador foi super atencioso e explicou cada produto com paciência.' },
      { score: 9,  text: 'Ótimo atendimento, tirou minhas dúvidas e foi rápido!' },
      { score: 7,  text: 'Poderia ter sido mais ágil no caixa, mas foi cordial.' },
      { score: 10, text: 'Nota 10! Sempre volto por causa do atendimento.' },
      { score: 6,  text: 'Achei demorado, porém resolveram meu problema.' },
      { score: 9,  text: 'Muito bom! Indicou promoções e economizei.' },
      { score: 8,  text: 'Legal, mas o produto não estava no estoque inicialmente.' },
      { score: 10, text: 'Excelente, adorei as sugestões de cortes para o jantar.' },
    ];

    // 3) Refs DOM
    const wrap   = document.getElementById('reviewsWrap');
    const tplEl  = document.getElementById('tplReview');
    const btnMore= document.getElementById('btnMore');
    if (!wrap || !tplEl || !tplEl.content || !btnMore) {
      console.error('[reviews] IDs ausentes (#reviewsWrap, #tplReview, #btnMore).');
      return;
    }

    let cursor = 0;
    const PAGE = 5;

    function renderNext(){
      const slice = ALL_REVIEWS.slice(cursor, cursor + PAGE);
      slice.forEach(r => {
        const node = document.importNode(tplEl.content, true);
        node.querySelector('.review-score').textContent = r.score;
        node.querySelector('.review-text').textContent  = r.text;
        const stars = node.querySelector('.stars');
        stars.innerHTML = '';
        stars.appendChild(makeStars(r.score));
        wrap.appendChild(node);
      });
      cursor += slice.length;

      if (cursor >= ALL_REVIEWS.length) {
        btnMore.disabled = true;
        btnMore.textContent = 'Todas as avaliações carregadas';
        btnMore.classList.add('disabled');
      }
    }

    // 4) Inicializa
    renderNext();
    btnMore.addEventListener('click', renderNext);
  });
})();