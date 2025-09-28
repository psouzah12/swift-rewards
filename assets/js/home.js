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

// Inicializa a lista
renderMissions();