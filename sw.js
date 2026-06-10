// Hardware OS Background Trigger Service Worker Engine
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const dealId = event.notification.data ? event.notification.data.dealId : null;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Check if application tab is active in the background context
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url && 'focus' in client) {
                    return client.focus().then(focusedClient => {
                        if (dealId) {
                            focusedClient.postMessage({ action: 'triggerAlarmUI', dealId: dealId });
                        }
                    });
                }
            }
            // If the App process is completely killed, deploy a fresh frame window
            if (clients.openWindow) {
                return clients.openWindow('./').then(windowClient => {
                    setTimeout(() => {
                        if (dealId && windowClient) {
                            windowClient.postMessage({ action: 'triggerAlarmUI', dealId: dealId });
                        }
                    }, 2500); // 2.5 Sec buffer delay to complete DOM tree boot
                });
            }
        })
    );
});