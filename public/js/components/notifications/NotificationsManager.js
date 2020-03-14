import Notification from './Notification.js';

export default class NotificationsManager {
	constructor(domNode, pageComponents) {
		this.notifications = domNode;
		this.notificationsStack = [];
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		this.notify = this.notify.bind(this);
		document.body.addEventListener('notifier:notify', this.notify);
	}

	/**
	 * @public
	 */
	notify(event) {
		if (!event.detail || !event.detail.message) {
			console.warn(event.target + ' send event. But message is missed! Notification not showed');
			return;
		}
		const notification = new Notification(this.notifications, event.detail.message, event.detail.type);
		notification.init();
	}

	destroy() {
		document.body.removeEventListener('notifier:notify', this.notify);
	}
}
