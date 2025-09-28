document.addEventListener('DOMContentLoaded', () => {
  // --------- proteção de rota ---------
  if (!window.Storage || typeof Storage.get !== 'function') {
    console.error('[points] main.js não carregou. Verifique a ORDEM e o CAMINHO dos scripts.');
    return;
  }
  const user = Storage.get();
  if (!user) {
    location.href = './login.html';
    return;
  }

  // --------- estado inicial ---------
  let points = Number(user.points || 0);
  let pointsHidden = JSON.parse(localStorage.getItem('sr_hide_points') || 'false');
  let history = JSON.parse(localStorage.getItem('sr_history') || '[]');

  // Ajuste suas imagens aqui (ou deixe sem img para fallback de cor)
  const rewards = [
    { id: 11, title: 'Vale Compras Swift', subtitle: 'R$ 100 para usar nas lojas Swift', cost: 200, img: '../assets/img/illustrations/vale-compras.png' },
    { id: 12, title: 'Kit Degustação Swift', subtitle: 'Combo com 2 produtos Swift',   cost: 120, img: '../assets/img/illustrations/kit-degustacao.png' },
    { id: 13, title: 'Folga especial',       subtitle: '1 folga extra (alinhar com gestor)', cost: 500, img: '../assets/img/illustrations/day-off.png' },
  ];

  // --------- refs ---------
  const pNow = document.getElementById('pointsNow');
  const levelBadge = document.getElementById('levelBadge');
  const btnToggle = document.getElementById('btnTogglePoints');
  const iconToggle = document.getElementById('iconTogglePoints');

  const tplReward = document.getElementById('tplReward');
  const tplHistory = document.getElementById('tplHistory');
  const rewardsWrap = document.getElementById('rewardsWrap');
  const historyWrap = document.getElementById('historyWrap');

  if (!tplReward || !tplReward.content || !rewardsWrap) {
    console.error('[points] Template de recompensa ou container não encontrados. IDs esperados: #tplReward e #rewardsWrap');
    return;
  }
  if (!tplHistory || !tplHistory.content || !historyWrap) {
    console.warn('[points] Template de histórico (#tplHistory) ou container (#historyWrap) não encontrados. Histórico ficará oculto.');
  }

  // --------- helpers ---------
  function levelFromPoints(p){
    if (p >= 2500) return 'Nível ouro';
    if (p >= 1000) return 'Nível prata';
    return 'Nível bronze';
  }
  function renderHeader(){
    if (pNow) pNow.textContent = pointsHidden ? '••••••' : `${new Intl.NumberFormat('pt-BR').format(points)} pontos`;
    if (levelBadge) levelBadge.textContent = levelFromPoints(points);
  }
  function syncIcon(){
    if (!iconToggle) return;
    iconToggle.classList.toggle('bi-eye', !pointsHidden);
    iconToggle.classList.toggle('bi-eye-slash', pointsHidden);
  }

  // --------- eventos header ---------
  btnToggle?.addEventListener('click', () => {
    pointsHidden = !pointsHidden;
    localStorage.setItem('sr_hide_points', JSON.stringify(pointsHidden));
    renderHeader(); syncIcon();
  });

  renderHeader(); syncIcon();

  // --------- render rewards ---------
  function renderRewards(){
    rewardsWrap.innerHTML = '';
    rewards.forEach(rw => {
      const node = document.importNode(tplReward.content, true);
      const $card   = node.querySelector('.reward');
      const $thumb  = node.querySelector('.reward-thumb');
      const $title  = node.querySelector('.reward-title');
      const $sub    = node.querySelector('.reward-sub');
      const $cost   = node.querySelector('.reward-cost');
      const $btn    = node.querySelector('.btn-redeem');

      if ($title) $title.textContent = rw.title;
      if ($sub)   $sub.textContent   = rw.subtitle;
      if ($cost)  $cost.innerHTML    = `<i class="bi bi-coin me-1"></i>${rw.cost} pontos`;

      // imagem como background para cobrir 100% do quadrado
      if ($thumb) {
        if (rw.img) {
          $thumb.style.backgroundImage = `url('${rw.img}')`;
          $thumb.style.backgroundSize = 'cover';
          $thumb.style.backgroundPosition = 'center';
          $thumb.style.backgroundRepeat = 'no-repeat';
        } else {
          // fallback elegante
          $thumb.style.background = '#f3f4f6';
        }
      }

      $btn?.addEventListener('click', () => {
        if (points < rw.cost) {
          alert('Pontos insuficientes para resgatar.');
          return;
        }
        if (confirm(`Confirmar resgate de "${rw.title}" por ${rw.cost} pontos?`)) {
          points -= rw.cost;
          Storage.set({ ...user, points });
          renderHeader();

          // histórico
          const entry = {
            title: rw.title,
            when: new Date().toLocaleDateString('pt-BR'),
            cost: rw.cost
          };
          history.unshift(entry);
          localStorage.setItem('sr_history', JSON.stringify(history));
          renderHistory();

          alert('Recompensa resgatada! Confira no histórico.');
        }
      });

      // toque visual opcional
      $card?.classList.add('hover-lift');

      rewardsWrap.appendChild(node);
    });
  }

  // --------- render history ---------
  function renderHistory(){
    if (!historyWrap || !tplHistory) return;
    historyWrap.innerHTML = '';
    if (history.length === 0){
      historyWrap.innerHTML = '<div class="text-secondary small">Ainda não há resgates.</div>';
      return;
    }
    history.forEach(h => {
      const node = document.importNode(tplHistory.content, true);
      const $title = node.querySelector('.history-title');
      const $when  = node.querySelector('.history-when');
      const $pts   = node.querySelector('.history-points');

      if ($title) $title.textContent = h.title;
      if ($when)  $when.textContent  = h.when;
      if ($pts)   $pts.textContent   = `-${h.cost} pts`;

      historyWrap.appendChild(node);
    });
  }

  // inicial
  renderRewards();
  renderHistory();
});