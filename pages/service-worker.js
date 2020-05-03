self.addEventListener('install', () => self.skipWaiting());

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

// Immediately claim any new clients. This is not needed to send messages, but
// makes for a better experience since the user does not need to refresh.
self.addEventListener('activate', (event) => {
	// Debug
	//self.clients.matchAll({
	//	includeUncontrolled: true
	//}).then((clientList) => {
	//	const urls = clientList.map((client) => client.url);
	//	console.log('[ServiceWorker] Matching clients:', urls.join(', '));
	//});

	event.waitUntil(self.clients.claim());
});
