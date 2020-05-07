// Message Relay
self.addEventListener('message', function(event) {
	const forwardMessage = self.clients.matchAll()
		.then((clientList) => {
			const senderID = event.source.id;

			clientList.forEach((client) => {
				if (client.id === senderID) {
					return;
				}

				client.postMessage({
					client: senderID,
					message: event.data
				});
			});
		});

	// If event.waitUntil is defined, use it to extend the lifetime of the Service Worker
	if (event.waitUntil) {
		event.waitUntil(forwardMessage);
	}
});

self.addEventListener('install', function(event) {
	// Bypass the waiting lifecycle stage,
	// just in case there's an older version of this SW registration.
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	// Take control of all pages under this SW's scope immediately,
	// instead of waiting for reload/navigation.

	// Debug
	//self.clients.matchAll({
	//	includeUncontrolled: true
	//}).then((clientList) => {
	//	const urls = clientList.map((client) => client.url);
	//	console.log('[ServiceWorker] Matching clients:', urls.join(', '));
	//});

	event.waitUntil(self.clients.claim());
});
