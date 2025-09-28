const form = document.getElementById('formLogin');
const email = document.getElementById('email');
const password = document.getElementById('password');
const togglePass = document.getElementById('togglePass');
const loginError = document.getElementById('loginError');

// Mostrar/ocultar senha
togglePass.addEventListener('click', () => {
  const isPwd = password.type === 'password';
  password.type = isPwd ? 'text' : 'password';
  togglePass.querySelector('i').classList.toggle('bi-eye');
  togglePass.querySelector('i').classList.toggle('bi-eye-slash');
});

// Mock de autenticação
form.addEventListener('submit', e => {
  e.preventDefault();
  loginError.classList.add('d-none');

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const ok = /@/.test(email.value) && password.value.length >= 6;
  if (ok) {
    const name = email.value.split('@')[0]
      .replace(/\./g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    Storage.set({ name, email: email.value, createdAt: Date.now(), points: 2893, level: 'Nível ouro' });
    location.href = 'home.html';
  } else {
    loginError.classList.remove('d-none');
  }
});