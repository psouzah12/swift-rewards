if(!Storage.get()) location.replace('login.html');
const wrap = document.getElementById('list');
const history = JSON.parse(localStorage.getItem('sr_history')||'[]');

if(history.length===0){
  wrap.innerHTML = `<div class="text-secondary">Você ainda não possui resgates.</div>`;
}else{
  wrap.innerHTML = history.map(h=>`
    <div class="history-item">
      <div class="history-left">
        <div class="title">${h.title}</div>
        <div class="when">${h.when}</div>
      </div>
      <div class="history-right">-${h.cost} pts</div>
    </div>
  `).join('');
}