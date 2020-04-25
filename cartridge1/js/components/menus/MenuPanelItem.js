import MenuItem from './MenuItem.js';

export default class MenuPanelItem {
	constructor(domNode, controllerComponent) {
		this.panel = domNode;
		this.controller = controllerComponent;

		this.menuItems = [];

		this.hasFocus = false;
		this.hasHover = false;

		this.firstItem = null;
		this.lastItem = null;

		this.menuItems = [];
	}

	init() {
		this.initEventListeners();
		this.initMenuItems();
		this.initFirstAndLastElements();

		console.log(this.menuItems)
	}

	initEventListeners() {

	}

	initMenuItems() {
		let elem = this.panel.firstElementChild;

		while (elem) {
			const menuElement = elem.firstElementChild;

			if (elem && menuElement && menuElement.tagName === 'A') {
				const menubarItem = new MenuItem(menuElement, this);
				menubarItem.init();
				this.menuItems.push(menubarItem);
			}

			elem = elem.nextElementSibling;
		}
	}

	initFirstAndLastElements() {
		const numItems = this.menuItems.length;
		if (numItems > 0) {
			this.firstItem = this.menuItems[0];
			this.lastItem = this.menuItems[numItems - 1];
		}
	}

	setFocusToController(cmd, menuItem) {
		const command = typeof cmd !== 'string' ? '' : cmd;

		if (command === 'previous') {
			this.controller.back();
		}

		if (command === 'next') {
			if (menuItem.domNode.hasAttribute('aria-haspopup')) {
				this.controller.forward(menuItem.domNode);
			}
		}
	}

	setFocusToItem(newItem) {
		newItem.domNode.tabIndex = 0;
		newItem.domNode.focus();

		this.currentlyFocusedMenuItem = newItem;
	}

	setFocusToFirstItem() {
		this.setFocusToItem(this.firstItem);
	}

	setFocusToLastItem() {
		this.setFocusToItem(this.lastItem);
	}

	setFocusToPreviousItem(currentItem) {
		const newItem = (currentItem === this.firstItem) ? this.lastItem
			: this.menuItems[this.getItemIndex(currentItem) - 1];
		this.setFocusToItem(newItem);
	}

	setFocusToNextItem(currentItem) {
		const newItem = (currentItem === this.lastItem) ? this.firstItem
			: this.menuItems[this.getItemIndex(currentItem) + 1];
		this.setFocusToItem(newItem);
	}

	setFocusToLastFocusedItem() {
		this.setFocusToItem(this.currentlyFocusedMenuItem);
	}

	getItemIndex(domNode) {
		return this.menuItems.indexOf(domNode);
	}

	close() {
		// menuItems try to close when they are blured
	}

	destroy() {
		clearTimeout(this.timeout);
		this.menuItems.forEach(item => item.destroy());
	}
}
