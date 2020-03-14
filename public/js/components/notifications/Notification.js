export default class Notification {
	constructor(domNode, message, type) {
		this.container = domNode;
		this.message = message;
		this.type = type;
		this.remainingTime = 2000;
	}

	init() {
		this.createMessage();
		this.timer(this.destroy.bind(this));
		this.addEventListeners();
	}

	addEventListeners() {
		this.timerPause = this.timerPause.bind(this);
		this.timer = this.timer.bind(this);
		this.destroy = this.destroy.bind(this);
		this.notification.addEventListener('mouseover', this.timerPause);
		this.notification.addEventListener('mouseout', this.timer);
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
			default:
				this.notification.className = 'b-notification m-info';
		}

		this.container.appendChild(this.notification);
	}

	timer() {
		this.creationTime = Date.now();
		if (this.hideTimer) {
			window.clearTimeout(this.hideTimer);
		}
		this.hideTimer = window.setTimeout(() => this.destroy(), this.remainingTime);
	}

	timerPause() {
		window.clearTimeout(this.hideTimer);
		this.remainingTime -= Date.now() - this.creationTime;
	}

	destroy() {
		if (this.hideTimer) {
			window.clearTimeout(this.hideTimer);
		}
		this.notification.removeEventListener('mouseover', this.timerPause);
		this.notification.removeEventListener('mouseout', this.timer);
		this.notification.removeEventListener('mouseup', this.destroy);
		this.notification.classList.add('m-removing');
		window.setTimeout(() => this.notification.remove(), 400);
	}
}
