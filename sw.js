// Hardware OS Level Autonomous Background Execution Thread Engine
let executionRegistry = [];

self.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'registerExternalTargetAlarm') {
        // Uniquely insert parameters into sandboxed isolation thread
        executionRegistry.push({
            dealId: event.data.dealId,
            triggerAt: event.data.triggerAt,
            title: event.data.title,
            body: event.data.body,
            fired: false
        });
    }
});

// Autonomous Infinite State Loop run inside background service framework
function runIsolatedSystemScanner() {
    const activeTimestamp = Date.now();
    executionRegistry.forEach(task => {
        if (!task.fired && activeTimestamp >= task.triggerAt) {
            task.fired = true;

            self.registration.showNotification(task.title, {
                body: task.body,
                data: { dealId: task.dealId },
                tag: String(task.dealId),
                requireInteraction: true,
                vibrate: [400, 100, 400, 100, 600]
            });
        }
    });
}

// OS Core Wakelock Trigger Points Linkage Nodes
setInterval(runIsolatedSystemScanner, 3000);

self.addEventListener('sync', function(event) {
    runIsolatedSystemScanner();
});

// Handling Application UI state wakeup call via notification tap interception
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetDealId = event.notification.data ? event.notification.data.dealId : null;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Target routing if PWA framework instance is active in stack background
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url && 'focus' in client) {
                    return client.focus().then(focusedClient => {
                        if (targetDealId) {
                            focusedClient.postMessage({ action: 'triggerAlarmUI', dealId: targetDealId });
                        }
                    });
                }
            }
            // Fresh display frame boot injection if client process is hard killed
            if (clients.openWindow) {
                return clients.openWindow('./').then(windowClient => {
                    setTimeout(() => {
                        if (targetDealId && windowClient) {
                            windowClient.postMessage({ action: 'triggerAlarmUI', dealId: targetDealId });
                        }
                    }, 2500);
                });
            }
        })
    );
});