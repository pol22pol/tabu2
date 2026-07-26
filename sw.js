// Zmieniaj tę wartość przy każdej aktualizacji plików gry,
// żeby przeglądarka pobrała nowe wersje zamiast starych z cache.
const CACHE_NAME = 'tabu-cache-v1';

// Lista plików wymaganych do działania gry offline.
// Jeśli dodasz nową kategorię (nowy plik .json) albo nowy moduł JS,
// dopisz go tutaj.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './ogolne.json',
  './jedzenie.json',
  './geografia.json',
  './mlodziezowe.json',
  './popkultura.json',
  './przyroda.json',
  './sport.json',
  './technologia.json',
  './js/config.js',
  './js/cardsService.js',
  './js/teamManager.js',
  './js/timer.js',
  './js/history.js',
  './js/modal.js',
  './js/ui.js',
  './js/game.js',
  './js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalacja: pobierz i zapisz w cache wszystkie pliki gry.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Aktywacja: usuń stare wersje cache z poprzednich wdrożeń.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Obsługa żądań: najpierw cache, w tle spróbuj odświeżyć z sieci.
// Dzięki temu gra działa offline, a gdy jest internet - dostaje aktualizacje.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // brak sieci -> użyj cache

      return cachedResponse || networkFetch;
    })
  );
});
