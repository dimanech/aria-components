export default class Notification {
	constructor(domNode, options) {
		this.container = domNode;
		this.message = options.message;
		this.type = options.type;
		this.id = options.id;
		this.remainingTime = 4000;
	}

	init() {
		this.createMessage();
		this.autoHide(this.destroy.bind(this));
		this.addEventListeners();
	}

	addEventListeners() {
		this.autoHidePause = this.autoHidePause.bind(this);
		this.autoHide = this.autoHide.bind(this);
		this.destroy = this.destroy.bind(this);
		this.notification.addEventListener('mouseover', this.autoHidePause);
		this.notification.addEventListener('mouseout', this.autoHide);
		this.notification.addEventListener('mouseup', this.destroy);
	}

	createMessage() {
		this.notification = document.createElement('div');
		this.notification.setAttribute('role', 'alert');
		this.notification.innerText = this.message;

		switch (this.type) {
			case 'error':
				this.notification.className = 'b-notification m-error';
				break;
			case 'warning':
				this.notification.className = 'b-notification m-warning';
				break;
			case 'success':
				this.notification.className = 'b-notification m-success';
				break;
			default:
				this.notification.className = 'b-notification m-info';
		}

		this.container.appendChild(this.notification);
	}

	autoHide() {
		this.creationTime = Date.now();
		if (this.hideTimer) {
			window.clearTimeout(this.hideTimer);
		}
		this.hideTimer = window.setTimeout(() => this.destroy(), this.remainingTime);
	}

	autoHidePause() {
		window.clearTimeout(this.hideTimer);
		this.remainingTime -= Date.now() - this.creationTime;
	}

	destroy() {
		if (this.hideTimer) {
			window.clearTimeout(this.hideTimer);
		}
		this.notification.removeEventListener('mouseover', this.autoHidePause);
		this.notification.removeEventListener('mouseout', this.autoHide);
		this.notification.removeEventListener('mouseup', this.destroy);
		this.notification.classList.add('m-removing');
		this.notification.dispatchEvent(new CustomEvent('notifier:notification:removed', { bubbles: true, detail: this.id }));
		window.setTimeout(() => this.notification.remove(), 400);
	}
}
