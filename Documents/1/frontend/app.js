const API_URL = '';

// Registrar usuario
const addUserBtn = document.getElementById('addUser');
const usernameInput = document.getElementById('username');
const userList = document.getElementById('userList');
const attendanceList = document.getElementById('attendanceList');

async function fetchUsers() {
  const res = await fetch(`${API_URL}/attendance`);
  const data = await res.json();
  return data.users;
}

async function fetchAttendance() {
  const res = await fetch(`${API_URL}/attendance`);
  const data = await res.json();
  return data.attendance;
}

async function renderUsers() {
  const users = await fetchUsers();
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.name;
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.className = 'delete-btn';
    delBtn.onclick = async () => {
      await fetch(`${API_URL}/users/${user.id}`, { method: 'DELETE' });
      renderUsers();
      renderAttendanceList();
    };
    li.appendChild(delBtn);
    userList.appendChild(li);
  });
}

addUserBtn.onclick = async () => {
  const name = usernameInput.value.trim();
  if (!name) return;
  await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  usernameInput.value = '';
  renderUsers();
  renderAttendanceList();
};

async function renderAttendanceList() {
  const users = await fetchUsers();
  const attendance = await fetchAttendance();
  const today = new Date().toISOString().slice(0, 10);
  attendanceList.innerHTML = '';
  users.forEach(user => {
    const userAttendance = attendance.filter(a => a.userId === user.id && a.date.startsWith(today))[0];
    const div = document.createElement('div');
    div.innerHTML = `<strong>${user.name}</strong> `;
    if (userAttendance) {
      let statusText = '';
      if (userAttendance.status === 'present') statusText = '<span class="status-present">🟢 Presente</span>';
      if (userAttendance.status === 'late') statusText = '<span class="status-late">🟡 Retardo</span>';
      if (userAttendance.status === 'absent') statusText = '<span class="status-absent">🔴 Ausente</span>';
      let dateTime = userAttendance.date;
      if (dateTime.length === 10) {
        div.innerHTML += statusText + ` <span style='color:#888;font-size:0.9em;'>(${dateTime})</span>`;
      } else {
        const [fecha, hora] = dateTime.split('T');
        div.innerHTML += statusText + ` <span style='color:#888;font-size:0.9em;'>(${fecha} ${hora ? hora.slice(0,5) : ''})</span>`;
      }
    } else {
      const btns = document.createElement('span');
      btns.className = 'attendance-btns';
      [
        { status: 'present', emoji: '🟢' },
        { status: 'late', emoji: '🟡' },
        { status: 'absent', emoji: '🔴' }
      ].forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.emoji;
        btn.title = opt.status.charAt(0).toUpperCase() + opt.status.slice(1);
        btn.onclick = async () => {
          const now = new Date().toISOString();
          await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, status: opt.status, date: now })
          });
          renderAttendanceList();
        };
        btns.appendChild(btn);
      });
      div.appendChild(btns);
    }
    attendanceList.appendChild(div);
  });
}

// Inicializar
renderUsers();
renderAttendanceList();

// PWA: registrar service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
} 