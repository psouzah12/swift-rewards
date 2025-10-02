const u0 = Storage.get();
if(!u0) location.replace('login.html');

const f = document.getElementById('formUser');
const first = document.getElementById('firstName');
const last  = document.getElementById('lastName');
const email = document.getElementById('email');
const photo = document.getElementById('photo');

(function init(){
  const u = Storage.get();
  const parts = (u.name || '').split(' ');
  first.value = parts.shift() || '';
  last.value  = parts.join(' ');
  email.value = u.email || '';
})();

let tempPhoto = null;
photo.addEventListener('change', e=>{
  const file = e.target.files?.[0]; if(!file) return;
  if(file.size > 2*1024*1024){ alert('Imagem até 2MB'); photo.value=''; return; }
  const reader = new FileReader();
  reader.onload = ()=> tempPhoto = reader.result;
  reader.readAsDataURL(file);
});

f.addEventListener('submit', e=>{
  e.preventDefault();
  const fn = first.value.trim(), ln = last.value.trim();
  if(!fn || !ln){ alert('Preencha nome e sobrenome'); return; }
  const cur = Storage.get();
  Storage.set({ ...cur, name: `${fn} ${ln}`, photoDataUrl: tempPhoto ?? cur.photoDataUrl ?? null });
  alert('Dados salvos!');
});