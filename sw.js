// Inner Leader 서비스워커
// 이 앱은 Firestore 실시간 데이터를 다루므로, 데이터 신선도가 중요합니다.
// 그래서 이 서비스워커는 데이터를 캐싱하지 않고, "홈 화면 앱"으로 설치 가능하도록
// 최소한의 역할만 하며, 항상 네트워크에서 최신 페이지를 받아옵니다.
const CACHE_NAME = 'innerleader-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    ))
  );
  self.clients.claim();
});

// 네트워크 우선, 실패했을 때만 캐시 사용 (오프라인 대비용 최소 동작)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
