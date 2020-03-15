import Notification from './Notification.js';

export default class NotificationsManager {
	constructor(domNode, pageComponents) {
		this.notificationsContainer = domNode;
		this.notificationsStack = [];
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		this.notify = this.notify.bind(this);
		this.removeHandler = this.removeHandler.bind(this);
		document.body.addEventListener('notifier:notify', this.notify);
		this.notificationsContainer.addEventListener('notifier:notification:removed', this.removeHandler);
	}

	/**
	 * @public
	 */
	notify(event) {
		if (!event.detail || !event.detail.message) {
			console.warn(event.target + ' send event. But message is missed! Notification not showed');
			return;
		}
		const id = 'notification-' + this.notificationsStack.length + (event.detail.id || '');

		const options = {
			message: event.detail.message,
			type: event.detail.type,
			id: id,
		};
		const notification = new Notification(this.notificationsContainer, options);
		notification.init();

		this.notificationsStack.push({
			id: id,
			notification: notification
		});
	}

	/**
	 * @public
	 */
	hide(id) {
		if (!id) {
			console.warn('Notification hide is called, but no ID is provided. Nothing to hide.');
			return;
		}
		this.notificationsStack.forEach((notification, index) => {
			if (notification.id === id) {
				notification.notification.destroy();
				this.notificationsStack.splice(index, 1);
			}
		});
	}

	hideLast() {
		this.notificationsStack[this.notificationsStack.length].notification.destroy();
		this.notificationsStack.pop();
	}

	hideFirst() {
		this.notificationsStack[0].notification.destroy();
		this.notificationsStack.shift();
	}

	hideAll() {
		this.notificationsStack.forEach(item => item.notification.destroy());
		this.notificationsStack = [];
	}

	removeHandler(event) {
		event.stopPropagation();
		this.notificationsStack.forEach((notification, index) => {
			if (notification.id === event.detail) {
				this.notificationsStack.splice(index, 1);
			}
		});

		console.log(this.notificationsStack)
	}

	destroy() {
		this.notificationsStack = [];
		this.notificationsContainer.removeEventListener('notifier:notification:removed', this.removeHandler);
		document.body.removeEventListener('notifier:notify', this.notify);
	}
}
