if(!Storage.get()) location.replace('login.html');

const hidePoints = document.getElementById('hidePoints');
const notif      = document.getElementById('notif');

hidePoints.checked = JSON.parse(localStorage.getItem('sr_hide_points') || 'false');
notif.checked      = JSON.parse(localStorage.getItem('sr_notif') || 'true');

hidePoints.addEventListener('change', ()=>{
  localStorage.setItem('sr_hide_points', JSON.stringify(hidePoints.checked));
});

notif.addEventListener('change', ()=>{
  localStorage.setItem('sr_notif', JSON.stringify(notif.checked));
});