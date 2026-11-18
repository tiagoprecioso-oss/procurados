// Service worker mínimo: só existe para o celular oferecer "instalar" / "adicionar à tela inicial".
// Não guarda nada em cache: cada vez que abre, o jogo vem do servidor (sempre a versão mais nova).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
