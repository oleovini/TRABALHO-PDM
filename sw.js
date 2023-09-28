import { offlineFallback, warmStrategyCache } from 'workbox-recipes';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute, Route } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Configuração do cache
const pageCache = new CacheFirst({
  cacheName: 'capivara-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60, // Expiração após 30 dias
    }),
  ],
});

// Indicando os recursos para o cache de página
warmStrategyCache({
  urls: [
    '/',
    '/index.html',
    '/offline.html',
    '/css/style.css',
    '/images/capibaraNotes.png',
    '/images/giphy.gif',
    '/js/main.js', 
    '/js/db.js',  
  ],
  strategy: pageCache,
});

// Registrando a rota para navegação
registerRoute(({ request }) => request.mode === 'navigate', ({ event }) => {
  return pageCache.handle({ event }); // Utiliza o cache de página para navegação
});

// Configuração do cache de assets (estilos, scripts, etc.)
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

self.addEventListener('install', (event) => {
  event.waitUtil(
    caches.open(capivara-cache)
    .then(cache => (cache.addAll(urls)))
  )

})


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

offlineFallback({
  pageFallback: '/offline.html',  
})


const imageRoute = new Route(({ request }) => {
  return request.destination === 'image';
}, new CacheFirst({
  cacheName: 'images',
  plugins: [
    new ExpirationPlugin({
      maxAgeSeconds: 60 * 60 * 24 * 30,
    })
  ]
}));



registerRoute(imageRoute);

