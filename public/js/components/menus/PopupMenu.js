import MenuItem from './MenuItem.js';

export default class PopupMenu {
	/*
	 * This content is based on w3.org design pattern examples and licensed according to the
	 * W3C Software License at
	 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
	 * Please see specification:
	 * https://www.w3.org/TR/wai-aria-practices/#menubutton
	 */
	constructor(domNode, controllerObj) {
		PopupMenu.validateStructure(domNode);

		this.domNode = domNode;
		this.controller = controllerObj;

		this.menuitems = [];

		this.hasFocus = false;
		this.hasHover = false;

		this.firstItem = null;
		this.lastItem = null;

		this.mouseOutTimeout = 30;

		this.cssClassNames = {
			open: '_open'
		};
	}

	init() {
		this.initEventListeners();
		this.initMenuItems();
		this.initFirstAndLastElements();
	}

	initEventListeners() {
		this.handleMouseover = this.handleMouseover.bind(this);
		this.handleMouseout = this.handleMouseout.bind(this);

		this.domNode.addEventListener('mouseenter', this.handleMouseover);
		this.domNode.addEventListener('mouseleave', this.handleMouseout);
	}

	initMenuItems() {
		// Change this to recursive init submenus if needed
		this.domNode.querySelectorAll('[role="menuitem"]').forEach((item) => {
			const menuItem = new MenuItem(item, this);
			menuItem.init();
			this.menuitems.push(menuItem);
		});
	}

	initFirstAndLastElements() {
		const numItems = this.menuitems.length;
		if (numItems > 0) {
			// eslint-disable-next-line prefer-destructuring
			this.firstItem = this.menuitems[0];
			this.lastItem = this.menuitems[numItems - 1];
		}
	}

	handleMouseover() {
		this.hasHover = true;
	}

	handleMouseout() {
		this.hasHover = false;
		// Need timeout to improve UX. Note that controller should implement this
		// timeout also.
		this.timeout = setTimeout(this.close.bind(this), this.mouseOutTimeout);
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

	setFocusToItem(newItem) {
		newItem.domNode.tabIndex = 0;
		newItem.domNode.focus();
	}

	setFocusToFirstItem() {
		this.setFocusToItem(this.firstItem);
	}

	setFocusToLastItem() {
		this.setFocusToItem(this.lastItem);
	}

	setFocusToPreviousItem(currentItem) {
		const newItem = (currentItem === this.firstItem) ? this.lastItem
			: this.menuitems[this.getItemIndex(currentItem) - 1];
		this.setFocusToItem(newItem);
	}

	setFocusToNextItem(currentItem) {
		const newItem = (currentItem === this.lastItem) ? this.firstItem
			: this.menuitems[this.getItemIndex(currentItem) + 1];
		this.setFocusToItem(newItem);
	}

	getItemIndex(domNode) {
		return this.menuitems.indexOf(domNode);
	}

	open() {
		this.togglePopup(true);
		return true;
	}

	close(force) {
		if (force) {
			this.togglePopup(false);
			return true;
		}

		const hasFocusWithin = this.hasFocus || this.menuitems.some(item => item.popupMenu && item.popupMenu.hasFocus);
		const hasHoverOnController = this.controller.isMenubarItem ? this.controller.hasHover : false;

		if (!hasFocusWithin && !this.hasHover && !hasHoverOnController) {
			this.togglePopup(false);
			return true;
		}

		return false;
	}

	togglePopup(isOpen) {
		this.domNode.classList.toggle(this.cssClassNames.open, isOpen);
		this.domNode.setAttribute('aria-hidden', !isOpen);
		this.controller.setExpanded(isOpen);
	}

	destroy() {
		this.domNode.removeEventListener('mouseenter', this.handleMouseover);
		this.domNode.removeEventListener('mouseleave', this.handleMouseout);
		this.close(true);
		clearTimeout(this.timeout);
		this.menuitems.forEach(item => item.destroy());
	}

	static validateStructure(domNode) {
		const msgPrefix = 'PopupMenu constructor argument domNode ';

		// Check whether menubarNode is a DOM element
		if (!(domNode instanceof Element)) {
			throw new TypeError(`${msgPrefix} is not a DOM Element.`);
		}

		// Check whether menubarNode has descendant elements
		if (domNode.childElementCount === 0) {
			throw new Error(`${msgPrefix} has no element children.`);
		}

		// Check whether domNode descendant elements have A elements
		let childElement = domNode.firstElementChild;
		while (childElement) {
			const menuitem = childElement.firstElementChild;
			if (menuitem && menuitem === 'A') {
				throw new Error(`${msgPrefix} has descendant elements that are not A elements.`);
			}
			childElement = childElement.nextElementSibling;
		}
	}
};
