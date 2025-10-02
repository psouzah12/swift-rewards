// Protege rota
const user = Storage.get();
if (!user) { location.replace('login.html'); }

/* -----------------------
   Helpers de Avatar
------------------------*/
function hueFromString(str){
  let h = 0; for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function getInitials(fullname){
  if (!fullname) return '?';
  const parts = fullname.trim().split(/\s+/);
  const ini = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  return ini.toUpperCase();
}

/* -----------------------
   Render UI (nome, avatar, métricas)
------------------------*/
function renderProfile(){
  const u = Storage.get() || user;

  // Nome
  document.getElementById('profileName').textContent = u.name || 'Colaborador';

  // Avatar
  const av = document.getElementById('profileAvatar');
  if (!av) return;

  if (u.photoDataUrl) {
    av.classList.add('avatar-img');
    av.style.backgroundImage = `url('${u.photoDataUrl}')`;
    av.textContent = '';
  } else {
    av.classList.remove('avatar-img');
    av.style.backgroundImage = '';
    av.textContent = getInitials(u.name || 'Usuario');
    av.style.setProperty('--h', String(hueFromString(u.name || 'Usuario')));
  }
}

// Métricas mock
const metrics = { reviews: 39, sales: 126, missions: 42 };
document.getElementById('mReviews').textContent = metrics.reviews;
document.getElementById('mSales').textContent   = metrics.sales;
document.getElementById('mMissions').textContent= metrics.missions;

// Inicial
renderProfile();

/* -----------------------
   Modal: Editar Perfil
------------------------*/
const form   = document.getElementById('formEditProfile');
const fName  = document.getElementById('firstName');
const lName  = document.getElementById('lastName');
const photoI = document.getElementById('photoInput');
const photoP = document.getElementById('photoPreview');
const removeBtn = document.getElementById('btnRemovePhoto');

let tempPhoto = null; // DataURL temporário até salvar

// Prepara modal ao abrir
document.getElementById('editProfileModal')?.addEventListener('show.bs.modal', () => {
  const u = Storage.get() || user;
  const parts = (u.name || '').split(' ');
  fName.value = parts.shift() || '';
  lName.value = parts.join(' ') || '';
  tempPhoto = u.photoDataUrl || null;

  // preview
  if (tempPhoto) {
    photoP.classList.add('avatar-img');
    photoP.style.backgroundImage = `url('${tempPhoto}')`;
    photoP.textContent = '';
  } else {
    photoP.classList.remove('avatar-img');
    photoP.style.backgroundImage = '';
    photoP.textContent = getInitials(u.name || 'Usuario');
    photoP.style.setProperty('--h', String(hueFromString(u.name || 'Usuario')));
  }
  // limpa input de arquivo
  photoI.value = '';
});

// Preview ao escolher arquivo
photoI?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('Arquivo muito grande. Escolha uma imagem até 2MB.');
    photoI.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    tempPhoto = reader.result; // DataURL
    photoP.classList.add('avatar-img');
    photoP.style.backgroundImage = `url('${tempPhoto}')`;
    photoP.textContent = '';
  };
  reader.readAsDataURL(file);
});

// Remover foto
removeBtn?.addEventListener('click', () => {
  tempPhoto = null;
  const u = Storage.get() || user;
  photoP.classList.remove('avatar-img');
  photoP.style.backgroundImage = '';
  photoP.textContent = getInitials(u.name || 'Usuario');
  photoP.style.setProperty('--h', String(hueFromString(u.name || 'Usuario')));
});

// Salvar
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const first = fName.value.trim();
  const last  = lName.value.trim();
  if (!first || !last) {
    alert('Preencha nome e sobrenome.');
    return;
  }
  const updated = {
    ...(Storage.get() || user),
    name: `${first} ${last}`,
    photoDataUrl: tempPhoto || null
  };
  Storage.set(updated);
  renderProfile();

  const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
  modal?.hide();
});

/* -----------------------
   Logout
------------------------*/
document.getElementById('btnLogout')?.addEventListener('click', ()=>{
  if (confirm('Deseja realmente sair?')) {
    Storage.clear();
    location.replace('login.html');
  }
});