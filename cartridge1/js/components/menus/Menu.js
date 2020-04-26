import MenuItem from './MenuItem.js';

export default class Menu {
	constructor(domNode, controllerComponent) {
		this.domNode = domNode;
		this.controller = controllerComponent;

		this.menuItems = [];

		this.hasFocus = false;
		this.hasHover = false;

		this.firstItem = null;
		this.lastItem = null;
	}

	init() {
		this.initMenuItems();
		this.initFirstAndLastElements();
	}

	initMenuItems() {
		// Change this to recursive init submenus if needed
		const menu = this.domNode.getAttribute('role') === 'menu'
			? this.domNode : this.domNode.querySelector('[role=menu]');

		let menuItemsNodes = [];

		for (let item of menu.children) {
			if (item.getAttribute('role') === 'menuitem') {
				menuItemsNodes.push(item);
			} else {
				const element = item.querySelector('[role=menuitem]');
				if (element) {
					menuItemsNodes.push(element);
				}
			}
		}

		menuItemsNodes.forEach(menuElement => {
			const menubarItem = new MenuItem(menuElement, this);
			menubarItem.init();
			this.menuItems.push(menubarItem);
		});
	}

	initFirstAndLastElements() {
		const numItems = this.menuItems.length;
		if (numItems > 0) {
			// eslint-disable-next-line prefer-destructuring
			this.firstItem = this.menuItems[0];
			this.lastItem = this.menuItems[numItems - 1];
		}
	}

	setFocusToController(cmd) {
		const command = typeof cmd !== 'string' ? '' : cmd;

		if (command === '') {
			if (this.controller && this.controller.domNode) {
				// focus controller node and handle event on his side
				this.controller.domNode.focus();
			}
			return;
		}

		if (this.controller.isMenubarItem) {
			if (command === 'previous') {
				this.controller.menuBar.setFocusToPreviousItem(this.controller);
			}
			if (command === 'next') {
				this.controller.menuBar.setFocusToNextItem(this.controller);
			}
		}
	}

	setFocusToItem(menuItem) {
		menuItem.domNode.tabIndex = 0;
		menuItem.domNode.focus();
		this.currentMenuItem = menuItem;
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

	setFocusToCurrentItem() {
		this.setFocusToItem(this.currentMenuItem);
	}

	getItemIndex(domNode) {
		return this.menuItems.indexOf(domNode);
	}

	open() {
		return true;
	}

	close(isForce) {
		if (isForce) {
			return true;
		}
		return true;
	}

	menuItemClick() {}

	destroy() {
		this.close(true);
		this.menuItems.forEach(item => item.destroy());
	}
}
