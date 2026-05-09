// Generate floating berries
const container = document.getElementById('bgBerries');
const emojis = ['🍓','🌸','🎀','🍰','🌿','✨','💖'];
for (let i = 0; i < 28; i++) {
  const el = document.createElement('span');
  el.className = 'bb';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.animationDuration = (8 + Math.random() * 12) + 's';
  el.style.animationDelay = (Math.random() * 14) + 's';
  el.style.fontSize = (.9 + Math.random() * 1.4) + 'rem';
  container.appendChild(el);
}

const guestName = document.getElementById('guestName');
const confirmButton = document.getElementById('confirmButton');
const message = document.getElementById('rsvpMessage');
const secretAdminButton = document.getElementById('secretAdminButton');

const STORAGE_KEY = 'convite-malu-confirmados';
const db = typeof initFirebaseApp === 'function' ? initFirebaseApp() : null;
const backendEnabled = !!db;
let confirmedGuests = loadConfirmedGuests();

function canUseLocalStorage() {
  try {
    const testKey = '__convite_malu_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function loadConfirmedGuests() {
  let stored = [];
  if (canUseLocalStorage()) {
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      stored = [];
    }
  }

  if (!Array.isArray(stored) || stored.length === 0) {
    try {
      const payload = JSON.parse(window.name || '{}');
      if (Array.isArray(payload.confirmed)) {
        stored = payload.confirmed;
        if (canUseLocalStorage()) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        }
      }
    } catch (error) {
      stored = stored || [];
    }
  }

  return Array.isArray(stored) ? stored : [];
}

function saveConfirmed(nameValue) {
  const payload = { confirmed: confirmedGuests };
  if (canUseLocalStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(confirmedGuests));
  }
  window.name = JSON.stringify(payload);
  if (backendEnabled && nameValue) {
    saveRemoteConfirmed(nameValue);
  }
}

function saveRemoteConfirmed(nameValue) {
  if (!backendEnabled) {
    return;
  }

  const ref = db.ref('confirmados').push();
  ref.set({
    name: nameValue,
    createdAt: Date.now()
  }).catch(error => {
    console.warn('Falha ao salvar confirmação no Firebase:', error);
  });
}

function showMessage(text, type = 'normal') {
  message.textContent = text;
  if (type === 'error') {
    message.style.color = '#ffe8e9';
  } else if (type === 'success') {
    message.style.color = '#d8ffdf';
  } else {
    message.style.color = 'rgba(255,255,255,.9)';
  }
}

confirmButton.addEventListener('click', () => {
  const nameValue = guestName.value.trim();
  if (!nameValue) {
    showMessage('Por favor, digite seu nome para confirmar.', 'error');
    return;
  }
  const normalized = nameValue.toLowerCase();
  const alreadyConfirmed = confirmedGuests.some(name => name.toLowerCase() === normalized);
  if (alreadyConfirmed) {
    showMessage(`${nameValue} já foi confirmado(a).`, 'error');
    return;
  }
  confirmedGuests.push(nameValue);
  saveConfirmed(nameValue);
  showMessage(`Presença de ${nameValue} confirmada! Obrigado, Malu está feliz.`, 'success');
  guestName.value = '';
});

guestName.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    confirmButton.click();
  }
});

secretAdminButton.addEventListener('click', () => {
  window.location.href = 'admin.html';
});