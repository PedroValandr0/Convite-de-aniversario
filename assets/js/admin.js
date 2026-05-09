const passwordInput = document.getElementById('adminPassword');
const unlockButton = document.getElementById('unlockButton');
const messageBox = document.getElementById('message');
const confirmedSection = document.getElementById('confirmedSection');
const confirmedList = document.getElementById('confirmedList');

const STORAGE_KEY = 'convite-malu-confirmados';
const ADMIN_PASSWORD = 'valandros';
const db = typeof initFirebaseApp === 'function' ? initFirebaseApp() : null;
const backendEnabled = !!db;

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

function getConfirmedNames() {
  let confirmedNames = [];
  if (canUseLocalStorage()) {
    try {
      confirmedNames = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      confirmedNames = [];
    }
  }

  if (!Array.isArray(confirmedNames) || confirmedNames.length === 0) {
    try {
      const payload = JSON.parse(window.name || '{}');
      if (Array.isArray(payload.confirmed)) {
        confirmedNames = payload.confirmed;
        if (canUseLocalStorage()) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(confirmedNames));
        }
      }
    } catch (error) {
      confirmedNames = confirmedNames || [];
    }
  }

  return Array.isArray(confirmedNames) ? confirmedNames : [];
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = 'message ' + type;
}

function renderConfirmed() {
  confirmedList.innerHTML = '';
  if (backendEnabled) {
    const ref = db.ref('confirmados');
    ref.once('value').then(snapshot => {
      const data = snapshot.val() || {};
      const items = Object.keys(data).map(key => ({ id: key, name: data[key].name || '' }));
      document.getElementById('counter').textContent = `Total: ${items.length}`;
      if (items.length === 0) {
        confirmedList.innerHTML = '<div class="confirmed-item">Ainda não há confirmações.</div>';
        return;
      }
      items.forEach(itemData => {
        const item = document.createElement('div');
        item.className = 'confirmed-item';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = itemData.name;

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-button';
        removeButton.textContent = 'Remover';
        removeButton.type = 'button';
        removeButton.addEventListener('click', () => removeConfirmedName(itemData.id, itemData.name));

        item.appendChild(nameSpan);
        item.appendChild(removeButton);
        confirmedList.appendChild(item);
      });
    }).catch(error => {
      confirmedList.innerHTML = '<div class="confirmed-item">Falha ao carregar confirmações remotas.</div>';
      console.warn('Erro ao ler confirmações do Firebase:', error);
    });
    return;
  }

  const confirmedNames = getConfirmedNames();
  document.getElementById('counter').textContent = `Total: ${confirmedNames.length}`;
  if (confirmedNames.length === 0) {
    confirmedList.innerHTML = '<div class="confirmed-item">Ainda não há confirmações.</div>';
    return;
  }
  confirmedNames.forEach(name => {
    const item = document.createElement('div');
    item.className = 'confirmed-item';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.textContent = 'Remover';
    removeButton.type = 'button';
    removeButton.addEventListener('click', () => removeConfirmedName(name));

    item.appendChild(nameSpan);
    item.appendChild(removeButton);
    confirmedList.appendChild(item);
  });
}

function removeConfirmedName(idOrName, maybeName) {
  if (backendEnabled && typeof idOrName === 'string' && maybeName !== undefined) {
    db.ref(`confirmados/${idOrName}`).remove().then(() => {
      renderConfirmed();
      showMessage(`${maybeName} foi removido(a) da lista.`, 'success');
    }).catch(error => {
      showMessage('Falha ao remover confirmação remota.', 'error');
      console.warn('Erro ao remover confirmação do Firebase:', error);
    });
    return;
  }

  const nameToRemove = idOrName;
  const confirmedNames = getConfirmedNames();
  const updatedNames = confirmedNames.filter(name => name.toLowerCase() !== nameToRemove.toLowerCase());
  if (canUseLocalStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNames));
  }
  window.name = JSON.stringify({ confirmed: updatedNames });
  renderConfirmed();
  showMessage(`${nameToRemove} foi removido(a) da lista.`, 'success');
}

unlockButton.addEventListener('click', () => {
  const code = passwordInput.value.trim();
  if (code.toLowerCase() !== ADMIN_PASSWORD) {
    showMessage('Senha incorreta. Tente novamente.', 'error');
    return;
  }
  passwordInput.value = '';
  confirmedSection.style.display = 'block';
  renderConfirmed();
  showMessage('Senha correta! Lista de confirmados liberada.', 'success');
});

passwordInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    unlockButton.click();
  }
});