export default class Notification {
	constructor(domNode, options) {
		this.container = domNode;
		this.message = options.message;
		this.type = options.type;
		this.id = options.id;
		this.remainingTime = 4000;
		this.isPersistent = options.isPersistent;
	}

	init() {
		this.createMessage();
		this.addEventListeners();
		if (!this.isPersistent) {
			this.autoHide(this.destroy.bind(this));
		}
	}

	addEventListeners() {
		this.autoHidePause = this.autoHidePause.bind(this);
		this.autoHide = this.autoHide.bind(this);
		this.destroy = this.destroy.bind(this);
		if (!this.isPersistent) {
			this.notificationNode.addEventListener('mouseover', this.autoHidePause);
			this.notificationNode.addEventListener('mouseout', this.autoHide);
		}
		this.notificationNode.addEventListener('mouseup', this.destroy);
	}

	createMessage() {
		this.notificationNode = document.createElement('div');
		this.notificationNode.setAttribute('role', 'alert');
		this.notificationNode.innerText = this.message;

		switch (this.type) {
			case 'error':
				this.notificationNode.className = 'b-notification m-error';
				break;
			case 'warning':
				this.notificationNode.className = 'b-notification m-warning';
				break;
			case 'success':
				this.notificationNode.className = 'b-notification m-success';
				break;
			default:
				this.notificationNode.className = 'b-notification m-info';
		}

		this.container.appendChild(this.notificationNode);
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
		if (!this.isPersistent) {
			this.notificationNode.removeEventListener('mouseover', this.autoHidePause);
			this.notificationNode.removeEventListener('mouseout', this.autoHide);
		}
		this.notificationNode.removeEventListener('mouseup', this.destroy);
		this.notificationNode.classList.add('m-removing');
		this.notificationNode.dispatchEvent(new CustomEvent('notifier:notification:removed', { bubbles: true, detail: {id: this.id} }));
		window.setTimeout(() => this.notificationNode.remove(), 400);
	}
}
