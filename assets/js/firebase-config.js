/*
  Para funcionar entre dispositivos, você precisa criar um projeto no Firebase
  e colar aqui os dados do seu projeto.

  1) Acesse https://console.firebase.google.com/
  2) Crie um novo projeto
  3) Vá em Realtime Database e ative o banco (modo de teste ou regras seguras)
  4) Vá em Configurações do projeto > Seus apps > Web
  5) Copie os valores do Firebase SDK e cole abaixo

  Exemplo:
  apiKey: 'AAAABBBBCCCC',
  authDomain: 'meuprojeto.firebaseapp.com',
  databaseURL: 'https://meuprojeto-default-rtdb.firebaseio.com',
  projectId: 'meuprojeto',
  storageBucket: 'meuprojeto.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef123456'
*/

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAocZra_slvWB64Ab3w0fnPza8EBR_mKH4',
  authDomain: 'convite-de-aniversario-92c00.firebaseapp.com',
  databaseURL: 'https://convite-de-aniversario-92c00-default-rtdb.firebaseio.com',
  projectId: 'convite-de-aniversario-92c00',
  storageBucket: 'convite-de-aniversario-92c00.firebasestorage.app',
  messagingSenderId: '1084814610405',
  appId: '1:1084814610405:web:6cd5563348e4fbef45290c' // substiua pelo appId do SDK da web, não pelo measurementId
};

function initFirebaseApp() {
  if (typeof firebase === 'undefined' || !FIREBASE_CONFIG) {
    return null;
  }
  if (!FIREBASE_CONFIG.databaseURL || !/^https?:\/\//.test(FIREBASE_CONFIG.databaseURL)) {
    console.warn('Firebase config com databaseURL inválido. Confirmações remotas estão desativadas.');
    return null;
  }
  if (!FIREBASE_CONFIG.appId || !FIREBASE_CONFIG.appId.startsWith('1:')) {
    console.warn('Firebase config com appId inválido. Confirmações remotas podem não funcionar.');
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    return firebase.database();
  } catch (error) {
    console.warn('Falha ao inicializar o Firebase:', error);
    return null;
  }
}
