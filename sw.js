const CACHE = 'chitieu-v77';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'vendor/jsQR.js', 'scan-worker.js', 'manifest.webmanifest', 'logo-72.png', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Cache trước (mở app tức thì, chạy được khi không có mạng); mỗi bản phát hành đổi tên cache nên luôn lấy được bản mới
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
