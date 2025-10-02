// Protege rota
const user = Storage.get();
if (!user) location.replace('login.html');

/* ---------- helpers ---------- */
function firstNameOf(fullname){
  return (fullname || 'Colaborador').trim().split(/\s+/)[0];
}
function hueFromString(str){
  let h = 0; for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function initialsOf(fullname){
  if (!fullname) return '?';
  const parts = fullname.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

/* ---------- saudação (apenas primeiro nome) ---------- */
(function renderGreeting(){
  const el = document.getElementById('greeting');
  if (!el) return;
  const h = new Date().getHours();
  const turno = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  el.textContent = `${turno}, ${firstNameOf(user.name)}!`;
})();

/* ---------- avatar (foto do perfil OU iniciais) ---------- */
(function renderAvatar(){
  const el = document.getElementById('userAvatar'); // <div id="userAvatar" class="avatar avatar-text"></div>
  if (!el) return;

  if (user.photoDataUrl) {
    // tem foto → usa como background e remove o gradiente/iniciais
    el.classList.add('avatar-img');
    el.classList.remove('avatar-text');
    el.style.backgroundImage = `url('${user.photoDataUrl}')`;
    el.textContent = '';
  } else {
    // sem foto → iniciais com cor dinâmica
    el.classList.remove('avatar-img');
    el.classList.add('avatar-text');
    el.style.backgroundImage = '';
    el.textContent = initialsOf(user.name || 'Usuario');
    el.style.setProperty('--h', String(hueFromString(user.name || 'Usuario')));
  }
})();

/* ---------- pontos (olhinho) — se existir na Home ---------- */
(function wirePointsVisibility(){
  const pNow = document.getElementById('pointsNow');
  if (!pNow) return;

  let hidden = JSON.parse(localStorage.getItem('sr_hide_points') || 'false');
  const btn = document.getElementById('btnTogglePoints');
  const icon = document.getElementById('iconTogglePoints');

  function renderPoints(){
    pNow.textContent = hidden ? '••••••' : `${new Intl.NumberFormat('pt-BR').format(user.points || 0)} pontos`;
  }
  function syncIcon(){
    if (!icon) return;
    icon.classList.toggle('bi-eye', !hidden);
    icon.classList.toggle('bi-eye-slash', hidden);
  }

  renderPoints(); syncIcon();

  btn?.addEventListener('click', ()=>{
    hidden = !hidden;
    localStorage.setItem('sr_hide_points', JSON.stringify(hidden));
    renderPoints(); syncIcon();
  });
})();

/* ---------- MISSÕES ---------- */
// Carrega missões do dia do localStorage, senão cria mock
function defaultMissions(){
  return [
    { id: 'm1', chip: 'Rápida',    cta: 'Iniciar', title: 'Atender 3 clientes',            desc: 'Registre 3 atendimentos com feedback.', points: 30, done: false },
    { id: 'm2', chip: 'Destaque',  cta: 'Começar', title: 'Vender item em promoção',       desc: 'Conclua 1 venda de produto em destaque.', points: 50, done: false },
    { id: 'm3', chip: 'Qualidade', cta: 'Fazer',   title: 'Receber nota 9+ em avaliação',  desc: 'Garanta uma avaliação alta de um cliente.', points: 70, done: false },
  ];
}

let missions = JSON.parse(localStorage.getItem('sr_missions') || 'null') || defaultMissions();

const wrap = document.getElementById('missionsWrap');
const tpl  = document.getElementById('tplMission')?.content;

function saveMissions(){
  localStorage.setItem('sr_missions', JSON.stringify(missions));
}

// Gera novas missões (mock) — usado no botão "Ver novas"
function generateNewMissions(){
  const todaySeed = new Date().toISOString().slice(0,10);
  // pequena variação nos títulos/pontos só pra parecer “novo”
  missions = [
    { id: 'n1-'+todaySeed, chip: 'Rápida',   cta: 'Iniciar', title: 'Sugerir item complementar', desc: 'Ofereça 1 item complementar na venda.', points: 25, done: false },
    { id: 'n2-'+todaySeed, chip: 'Equipe',   cta: 'Começar', title: 'Apoiar um colega',          desc: 'Ajude em um atendimento movimentado.',  points: 40, done: false },
    { id: 'n3-'+todaySeed, chip: 'Qualidade',cta: 'Fazer',   title: 'Cliente recorrente',        desc: 'Identifique e registre 1 cliente fiel.', points: 60, done: false },
  ];
  saveMissions();
}

// Render do estado vazio
function renderEmptyMissions(){
  wrap.innerHTML = `
    <div class="empty-state card-soft text-center">
      <div class="empty-emoji">🎉</div>
      <h3 class="h6 fw-bold mb-1">Tudo em dia!</h3>
      <p class="text-secondary small mb-3">Você concluiu todas as missões de hoje.</p>
      <div class="d-flex gap-2 justify-content-center flex-wrap">
        <a href="./points.html" class="btn btn-pill">Trocar pontos</a>
        <button id="btnRefreshMissions" class="btn btn-outline-secondary">Ver novas</button>
      </div>
    </div>
  `;

  document.getElementById('btnRefreshMissions')?.addEventListener('click', ()=>{
    generateNewMissions();
    renderMissions();
  });
}

// Render normal (lista de missões não concluídas)
function renderMissions(){
  if (!wrap) return;

  const pending = missions.filter(m => !m.done);
  if (pending.length === 0) {
    renderEmptyMissions();
    return;
  }

  wrap.innerHTML = '';
  pending.forEach(m => {
    const node = document.importNode(tpl, true);
    node.querySelectorAll('*').forEach(el=>{
      el.innerHTML = el.innerHTML
        .replace('{{chip}}', m.chip)
        .replace('{{cta}}', m.cta)
        .replace('{{title}}', m.title)
        .replace('{{desc}}', m.desc)
        .replace('{{points}}', m.points);
    });

    // Ao clicar no CTA, marca como feito e re-renderiza
    node.querySelector('.btn-accept')?.addEventListener('click', ()=>{
      m.done = true;
      saveMissions();
      renderMissions();
      // feedback simples
      const toastMsg = document.createElement('div');
      toastMsg.className = 'mission-toast';
      toastMsg.textContent = `Missão concluída!`;
      document.body.appendChild(toastMsg);
      setTimeout(()=> toastMsg.classList.add('show'), 10);
      setTimeout(()=> { toastMsg.classList.remove('show'); setTimeout(()=>toastMsg.remove(), 250); }, 2000);

      // Atualiza pontos do usuário (mock)
      const updated = { ...user, points: (user.points || 0) + m.points };
      Storage.set(updated);
      // Se você exibe pontos na Home, re-renderize se necessário:
      const pNow = document.getElementById('pointsNow');
      if (pNow) pNow.textContent = `${new Intl.NumberFormat('pt-BR').format(updated.points)} pontos`;
    });

    wrap.appendChild(node);
  });
}

/* ===========================
   Notificações – UI + Dados
   =========================== */
const Notifs = {
  key: 'sr_notifs',
  get(){
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch { return []; }
  },
  set(v){ localStorage.setItem(this.key, JSON.stringify(v)); },
  seedIfEmpty(){
    const cur = this.get();
    if (cur.length) return;
    const now = Date.now();
    const sample = [
      { id: 'n1', title: 'Meta semanal batida 🎯', body: 'Parabéns! Você atingiu 120% da meta de vendas da semana. Continue assim!', ts: now - 1000*60*40, read: false },
      { id: 'n2', title: 'Nova missão disponível', body: 'Missão “Cliente recorrente” liberada. Vale 60 pontos!', ts: now - 1000*60*90, read: false },
      { id: 'n3', title: 'Resgate confirmado', body: 'Seu “Vale Compras Swift (R$ 100)” foi autorizado. Consulte seu e-mail.', ts: now - 1000*60*60*3, read: true },
    ];
    this.set(sample);
  }
};

// util: tempo relativo simples
function timeAgo(ts){
  const diff = Math.max(1, Math.floor((Date.now() - ts) / 1000)); // s
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff/60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h/24);
  return `${d}d`;
}

(function notifUI(){
  const btn = document.getElementById('btnNotif');
  const panel = document.getElementById('notifPanel');
  const list = document.getElementById('notifList');
  const empty = panel?.querySelector('.notif-empty');
  const btnClose = document.getElementById('btnCloseNotif');
  const btnMarkAll = document.getElementById('btnMarkAll');
  const tpl = document.getElementById('tplNotif');

  if (!btn || !panel || !list || !tpl) return;

  // cria seed se não houver nada
  Notifs.seedIfEmpty();

  function unreadCount(arr){ return arr.filter(n => !n.read).length; }
  function syncDot(){
    const dot = btn.querySelector('.notif-dot');
    const count = unreadCount(Notifs.get());
    if (dot) dot.style.display = count > 0 ? 'block' : 'none';
  }

  function render(){
    const data = Notifs.get().sort((a,b)=> b.ts - a.ts);
    list.innerHTML = '';
    if (!data.length){
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    data.forEach(n=>{
      const node = document.importNode(tpl.content, true);
      const root = node.querySelector('.notif-item');
      if (n.read) root.classList.add('read');
      root.dataset.id = n.id;

      root.querySelector('.title').textContent = n.title;
      root.querySelector('.body').textContent  = n.body;
      root.querySelector('.meta').textContent  = timeAgo(n.ts);

      // marcar como lida
      root.querySelector('.btn-read').addEventListener('click', ()=>{
        const all = Notifs.get();
        const it = all.find(x=>x.id===n.id);
        if (it){ it.read = true; Notifs.set(all); }
        render(); syncDot();
      });

      // ver/expandir
root.querySelector('.btn-view').addEventListener('click', ()=>{
  const titleEl = document.getElementById('notifModalTitle');
  const bodyEl  = document.getElementById('notifModalBody');
  titleEl.textContent = n.title;
  bodyEl.textContent = n.body;

  // marca lida ao abrir
  const all = Notifs.get();
  const it = all.find(x=>x.id===n.id);
  if (it){ it.read = true; Notifs.set(all); }
  render(); syncDot();

  // 🔒 fecha o painel antes de abrir o modal
  if (typeof closePanel === 'function') closePanel();

  // abre modal
  const modal = new bootstrap.Modal(document.getElementById('notifModal'));
  modal.show();
});

      list.appendChild(node);
    });
  }

// cria overlay com blur
function createNotifOverlay(){
  const el = document.createElement('div');
  el.className = 'notif-overlay';
  // fechar ao clicar no fundo:
  el.addEventListener('click', closePanel, { once: true });
  document.body.appendChild(el);
  return el;
}

let _notifOverlay = null;

function openPanel(){
  if (_notifOverlay) return;                // já aberto
  _notifOverlay = createNotifOverlay();
  // ...mostrar painel como você já faz...
}

function closePanel(){
  // ...esconder painel como você já faz...
  if (_notifOverlay){
    _notifOverlay.remove();
    _notifOverlay = null;
  }
}

  // posiciona painel abaixo do sino
  function positionPanel(){
    const r = btn.getBoundingClientRect();
    const panelW = Math.min(window.innerWidth*0.92, 380);
    panel.style.right = `${Math.max(8, window.innerWidth - r.right + 6)}px`;
    panel.style.top   = `${r.bottom + 8}px`;
    panel.style.width = `${panelW}px`;
  }

  // abrir/fechar
  let open = false;
  function openPanel(){
    positionPanel();
    panel.hidden = false;
    // força reflow para animar
    panel.getBoundingClientRect();
    panel.classList.add('show');
    open = true;
    document.addEventListener('click', onDocClick, { capture:true });
    window.addEventListener('resize', positionPanel);
  }
  function closePanel(){
    panel.classList.remove('show');
    open = false;
    setTimeout(()=>{ panel.hidden = true; }, 150);
    document.removeEventListener('click', onDocClick, { capture:true });
    window.removeEventListener('resize', positionPanel);
  }
  function onDocClick(e){
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    closePanel();
  }

  btn.addEventListener('click', (e)=>{
    e.preventDefault(); // não é link
    if (open) closePanel(); else openPanel();
  });
  btnClose.addEventListener('click', closePanel);

  btnMarkAll.addEventListener('click', ()=>{
    const all = Notifs.get().map(n => ({...n, read:true}));
    Notifs.set(all);
    render(); syncDot();
  });

  // inicial
  render(); syncDot();
})();

// Inicializa a lista
renderMissions();