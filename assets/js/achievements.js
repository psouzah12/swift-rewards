if(!Storage.get()) location.replace('login.html');

const data = [
  { emoji:'🥇', label:'Nível Ouro' },
  { emoji:'💬', label:'20 Avaliações' },
  { emoji:'🛒', label:'100 Vendas' },
  { emoji:'⏱️', label:'Meta Rápida' },
  { emoji:'🎯', label:'50 Missões' },
  { emoji:'🔥', label:'Semana Perfeita' },
];

document.getElementById('trophies').innerHTML = data.map(t=>`
  <div class="trophy">
    <div class="emoji">${t.emoji}</div>
    <div class="label">${t.label}</div>
  </div>
`).join('');