// Inter window / tabs communication
// Applicable for minicart count, wishlist count, added products,
// session timeout, cookies - consent tracking etc.

// Without valid certificate SW would not be installed, so apply your signed cert
// or move server to http mode

export default class MessageRelay {
	constructor(domNode) {
		this.domNode = domNode;
		this.eventBus = document;
	}

	init() {
		if (!navigator.serviceWorker) {
			return;
		}

		this.registerServiceWorker();
		this.initEventListeners();

		window.postSW = this.post
	}

	registerServiceWorker() {
		navigator.serviceWorker.register('./service-worker.js')
			.then((registration) => {
				this.serviceWorker = registration;
			}).catch(() => {
				if (!this.serviceWorker) {
					return;
				}
				this.serviceWorker.unregister().then(isUnregistered => {
					if (isUnregistered) {
						this.serviceWorker = null;
					}
				});
			});
	}

	initEventListeners() {
		this.onReceive = this.onReceive.bind(this);
		this.onPost = this.onPost.bind(this);

		navigator.serviceWorker.addEventListener('message', this.onReceive);
		this.eventBus.addEventListener('messageRelay:post', this.onPost);
	}

	destroyEventListeners() {
		navigator.serviceWorker.removeEventListener('message', this.onReceive);
		this.eventBus.removeEventListener('messageRelay:post', this.onPost);
	}

	onReceive(event) {
		const message = event.data.message;
		let customEvent = new CustomEvent('messageRelay:receive', { detail: message });

		if (typeof message === 'object' && message.event && message.data) {
			customEvent = new CustomEvent(message.event, { detail: message.data });
		}

		this.eventBus.dispatchEvent(customEvent);
	}

	onPost(event) {
		this.post(event.detail)
	}

	post(message) {
		if (!navigator.serviceWorker.controller) {
			// There isn't always a service worker to send a message to. This can happen
			// when the page is force reloaded.
			return;
		}

		navigator.serviceWorker.controller.postMessage(message);
	}

	destroy() {
		this.destroyEventListeners();
		this.serviceWorker.unregister();
	}
}
