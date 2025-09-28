// Service Worker pour maintenir la lecture en arrière-plan
self.addEventListener('install', (event) => {
  console.log('Service Worker installé pour la lecture en arrière-plan');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// Maintenir la session active
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    console.log('Maintien de la session pour la lecture continue');
    
    // Répondre pour confirmer que le service worker est actif
    event.ports[0].postMessage({ status: 'alive' });
  }
});

// Intercepter les requêtes pour maintenir la connectivité
self.addEventListener('fetch', (event) => {
  // Laisser passer toutes les requêtes normalement
  // mais maintenir le service worker actif
  if (event.request.url.includes('youtube.com')) {
    console.log('Requête YouTube interceptée pour maintien en arrière-plan');
  }
});