// Protege rota e obtém usuário
const user = Storage.get();
if (!user) { location.replace('login.html'); }

// ------- Constantes de faixa (ajuste aqui se mudar a regra) -------
const MAX = 2500; // Ouro a partir de 2500
const ranges = {
  bronze: { min: 0,    max: 999  },
  prata:  { min: 1000, max: 2499 },
  ouro:   { min: 2500, max: Infinity }
};

// ------- Pontos atuais -------
const points = Number(user.points || 0);

// ------- Atualiza chips e barra -------
(function renderLevel(){
  // Atualiza rótulo de pontos
  const ptLabel = document.getElementById('pointsLabel');
  ptLabel.textContent = new Intl.NumberFormat('pt-BR').format(points) + ' pts';

  // Define chip ativo
  const chips = document.querySelectorAll('.chip');
  chips.forEach(ch => ch.classList.remove('active'));

  let level = 'bronze';
  if (points >= ranges.ouro.min) level = 'ouro';
  else if (points >= ranges.prata.min) level = 'prata';

  document.querySelector(`.chip[data-level="${level}"]`)?.classList.add('active');

  // Calcula % de progresso até o Ouro (cap em 100%)
  const pct = Math.min(100, Math.max(0, (points / MAX) * 100));

  // Atualiza barra e ARIA
  const bar = document.getElementById('levelBar');
  const rail = document.querySelector('.progress-rail');
  bar.style.width = pct + '%';
  rail.setAttribute('aria-valuenow', Math.min(points, MAX));

  // Texto de status
  const status = document.getElementById('statusText');
  if (points >= ranges.ouro.min) {
    status.textContent = 'Você já está no topo! 🏆';
  } else if (points >= ranges.prata.min) {
    status.textContent =
      `Faltam ${new Intl.NumberFormat('pt-BR').format(ranges.ouro.min - points)} pts para Ouro`;
  } else {
    status.textContent =
      `Faltam ${new Intl.NumberFormat('pt-BR').format(ranges.prata.min - points)} pts para Prata`;
  }
})();