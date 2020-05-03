// ? WL buttons + WL icon

export default class Wishlist {
	constructor(domNode) {
		this.eventBus = document;
		this.container = domNode;
		this.icon = document.getElementById('wishlist-icon');
	}

	init() {
		this.initEventListeners();
		this.initModel();
		this.updateUI();
	}

	initEventListeners() {
		this.onReceiveUpdate = this.onReceiveUpdate.bind(this);
		this.updateUI = this.updateUI.bind(this);
		this.handleButtonClick = this.handleButtonClick.bind(this);

		this.eventBus.addEventListener('wishlist:update', this.onReceiveUpdate);
		this.eventBus.addEventListener('plp:updated', this.updateUI);
		this.container.addEventListener('click', this.handleButtonClick);
	}

	initModel() {
		// fetch wishlistModel from server or from global variable first
		this.wishlistModel = ['uuidA', 'uuidB', 'uuidC'];
	}

	updateModel(uuid) {
		const itemIndex = this.wishlistModel.indexOf(uuid);

		if (itemIndex === -1) {
			this.wishlistModel.push(uuid);
		} else {
			this.wishlistModel.splice(itemIndex, 1);
		}
	}

	updateUI() {
		document.querySelectorAll('[data-element-wishlist-button]').forEach(button => {
			this.toggleButtonState(button, button.getAttribute('data-uuid'));
		});
		this.updateIconState();
	}

	handleButtonClick(event) {
		const button = event.target;

		if (!button.hasAttribute('data-element-wishlist-button')) {
			return;
		}

		const uuid = button.getAttribute('data-uuid');
		if (!uuid) {
			return;
		}

		this.updateModel(uuid);
		this.toggleButtonState(button, uuid);
		this.updateIconState();
		this.broadcastUpdate();
	}

	updateIconState() {
		this.icon.innerText = this.wishlistModel.length;
	}

	toggleButtonState(node, uuid) {
		node.setAttribute('aria-pressed', this.wishlistModel.indexOf(uuid) !== -1);
	}

	onReceiveUpdate(event) {
		if (!event.detail) {
			return;
		}

		this.wishlistModel = event.detail;
		this.updateUI();
	}

	broadcastUpdate() {
		const detail = {
			event: 'wishlist:update',
			data: this.wishlistModel
		}
		this.eventBus.dispatchEvent(new CustomEvent('messageRelay:post', { detail: detail }));
	}

	destroy() {
		// TBD
	}
}
