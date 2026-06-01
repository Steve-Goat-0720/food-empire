// 缇庨甯濆浗 - Service Worker (PWA 绂荤嚎鏀寔)
const CACHE_NAME = 'food-empire-v3'
const ASSETS = [
  '/food-empire/',
  '/food-empire/index.html',
  '/food-empire/manifest.json',
  '/food-empire/icons/icon.svg',
  '/food-empire/restaurants.json',
]

// 瀹夎: 缂撳瓨鏍稿績璧勬簮
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

// 婵€娲? 娓呯悊鏃х紦瀛?self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    })
  )
  self.clients.claim()
})

// 璇锋眰鎷︽埅: 缂撳瓨绛栫暐 (缃戠粶浼樺厛 + 缂撳瓨鍥為€€)
self.addEventListener('fetch', (event) => {
  // 璺宠繃 API 璇锋眰鍜?Socket.io
  if (event.request.url.includes('/api/') || event.request.url.includes('socket.io')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 缂撳瓨鎴愬姛鐨?GET 璇锋眰
        if (event.request.method === 'GET' && response.status === 200) {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned)
          })
        }
        return response
      })
      .catch(() => {
        // 绂荤嚎鏃惰繑鍥炵紦瀛?        return caches.match(event.request).then((cached) => {
          return cached || new Response('绂荤嚎妯″紡 - 璇疯繛鎺ョ綉缁滃悗閲嶈瘯', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        })
      })
  )
})
