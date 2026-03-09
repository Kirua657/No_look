self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'test-push') {
    self.registration.showNotification('No Look テスト通知', {
      body: event.data.message,
      icon: '/icon_teacher.png',
      badge: '/icon_teacher.png'
    });
  }
});
self.addEventListener('push', function(event) {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification('No Look 通知', {
      body: data.message,
      icon: '/icon_teacher.png',
      badge: '/icon_teacher.png'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
