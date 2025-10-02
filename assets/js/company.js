if(!Storage.get()) location.replace('login.html');

const mock = {
  Loja: 'Swift Morumbi',
  Código: 'SWF-0391',
  Gestor: 'Carla Mendes',
  Telefone: '(11) 3333-1234',
  Endereço: 'Av. Giovanni Gronchi, 5000 — São Paulo/SP'
};

const box = document.getElementById('companyBox');
box.innerHTML = Object.entries(mock).map(([k,v])=>`
  <div>
    <div class="field-label">${k}</div>
    <div class="field-value">${v}</div>
  </div>
`).join('');