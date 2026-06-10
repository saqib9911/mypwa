// Standalone Autonomous Engine inside background sandbox environment
let executionRegistry = [];

self.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'registerExternalTargetAlarm') {
        executionRegistry.push({
            dealId: event.data.dealId,
            triggerAt: event.data.triggerAt,
            title: event.data.title,
            body: event.data.body,
            fired: false
        });
    }
});

// Autonomous Scheduler Core Thread Controller Loop
function runIsolatedSystemScanner() {
    const activeTimestamp = Date.now();
    executionRegistry.forEach(task => {
        if (!task.fired && activeTimestamp >= task.triggerAt) {
            task.fired = true;

            // Core Trigger Engine for Hard Closed Application State Alerting
            self.registration.showNotification(task.title, {
                body: task.body,
                data: { dealId: task.dealId },
                tag: String(task.dealId),
                requireInteraction: true,
                vibrate: [500, 200, 500, 200, 800],
                actions: [
                    { action: 'open_alarm', title: 'Open Alarm Panel' }
                ]
            });
        }
    });
}

// 3 Second Background Check Precision Trigger Clock
setInterval(runIsolatedSystemScanner, 3000);

self.addEventListener('sync', function(event) {
    runIsolatedSystemScanner();
});

// Catching the notification tap event, waking up app process context, and injecting the modal state
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetDealId = event.notification.data ? event.notification.data.dealId : null;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Context 1: App is already alive in memory but suspended in background stack
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
            // Context 2: App process is dead / hard killed by OS. Open instance fresh and wait for script boot.
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