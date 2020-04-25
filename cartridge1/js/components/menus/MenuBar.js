import MenuBarPopup from './MenuBarPopup.js';

export default class MenuBar {
	/*
	 * This content is based on w3.org design pattern examples and licensed according to the
	 * W3C Software License at
	 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
	 * Please see specification:
	 * https://www.w3.org/TR/wai-aria-practices/#menu
	 */
	constructor(domNode) {
		MenuBar.validateStructure(domNode);
		this.domNode = domNode;

		this.menubarItems = [];

		this.firstItem = null;
		this.lastItem = null;

		this.hasFocus = false;
		this.hasHover = false;

		this.activationDelay = 500;

		this.flyout = this.domNode.querySelector('[data-elem-menu-flyout-pane]');

		this.cssClassHover = '_hover';
	}

	init() {
		this.domNode.setAttribute('role', 'menubar');
		this.setUpMenuItems();
		if (this.menubarItems.length <= 0) {
			return;
		}
		this.initEventListeners();
		this.setFirstAndLastItems();
		this.firstItem.domNode.tabIndex = 0;
	}

	setUpMenuItems() {
		let elem = this.domNode.firstElementChild;

		while (elem) {
			const menuElement = elem.firstElementChild;

			if (elem && menuElement && menuElement.getAttribute('role') === 'menuitem') {
				const menubarItem = new MenuBarPopup(menuElement, this);
				menubarItem.init();
				this.menubarItems.push(menubarItem);
			}

			elem = elem.nextElementSibling;
		}
	}

	setFirstAndLastItems() {
		const numItems = this.menubarItems.length;
		this.firstItem = this.menubarItems[0];
		this.lastItem = this.menubarItems[numItems - 1];
	}

	initEventListeners() {
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);

		this.domNode.addEventListener('mouseenter', this.handleMouseEnter);
		this.domNode.addEventListener('mouseleave', this.handleMouseLeave);
	}

	removeEventListeners() {
		this.domNode.removeEventListener('mouseenter', this.handleMouseEnter);
		this.domNode.removeEventListener('mouseleave', this.handleMouseLeave);
	}

	handleMouseEnter() {
		const setIntentionalHover = () => {
			this.hasHover = true;
			this.menubarItems.forEach((barItem) => {
				if (barItem.hasHover) {
					barItem.domNode.classList.add(this.cssClassHover);
				}
				if (barItem.hasHover && barItem.popupMenu) {
					barItem.popupMenu.open();
				}
			});
		};
		this.timeout = setTimeout(setIntentionalHover, this.activationDelay);
	}

	handleMouseLeave() {
		clearTimeout(this.timeout);
		this.hasHover = false;
	}

	setFocusToItem(newItem) {
		let hasOpenedMenu = false; // open menu if bar has already opened menu

		this.menubarItems.forEach((barItem) => {
			if (barItem.isPopUpExpanded) {
				hasOpenedMenu = true;
			}
			barItem.domNode.tabIndex = -1;
			if (barItem.popupMenu) {
				barItem.popupMenu.close(true);
			}
		});

		newItem.domNode.focus();
		newItem.domNode.tabIndex = 0;

		if (hasOpenedMenu && newItem.popupMenu) {
			newItem.popupMenu.open();
		}
	}

	setFocusToFirstItem() {
		this.setFocusToItem(this.firstItem);
	}

	setFocusToLastItem() {
		this.setFocusToItem(this.lastItem);
	}

	setFocusToPreviousItem(currentItem) {
		const newItem = (currentItem === this.firstItem) ? this.lastItem
			: this.menubarItems[this.getElementIndex(currentItem) - 1];
		this.setFocusToItem(newItem);
	}

	setFocusToNextItem(currentItem) {
		const newItem = (currentItem === this.lastItem) ? this.firstItem
			: this.menubarItems[this.getElementIndex(currentItem) + 1];
		this.setFocusToItem(newItem);
	}

	getElementIndex(domNode) {
		return this.menubarItems.indexOf(domNode);
	}

	toggleFlyout(height) {
		const flyoutStyles = this.flyout.style;
		if (height === 0) {
			flyoutStyles.opacity = 0;
			flyoutStyles.height = '10vh';
			flyoutStyles.visibility = 'hidden';

			//window.partialOverlay.close();
		} else {
			clearTimeout(this.flyoutTimer);
			const topPosition = window.scrollY ? window.scrollY : window.pageYOffset;
			flyoutStyles.top = `${parseInt(this.domNode.getBoundingClientRect().bottom + topPosition, 10)}px`;
			flyoutStyles.opacity = 1;
			flyoutStyles.height = `${height + 4}px`;
			flyoutStyles.visibility = 'visible';

			//window.partialOverlay.open();
		}
	}

	destroy() {
		this.domNode.removeAttribute('role');
		this.removeEventListeners();
		clearTimeout(this.timeout);
		this.menubarItems.forEach((item) => {
			item.domNode.tabIndex = 0;
			item.destroy();
		});
	}

	static validateStructure(domNode) {
		const msgPrefix = 'MenuBar constructor argument menubarNode ';

		// Check whether menubarNode is a DOM element
		if (!(domNode instanceof Element)) {
			throw new TypeError(`${msgPrefix} is not a DOM Element.`);
		}

		// Check whether menubarNode has descendant elements
		if (domNode.childElementCount === 0) {
			throw new Error(`${msgPrefix} has no element children.`);
		}

		// Check whether menubarNode has A elements
		let menuElement = domNode.firstElementChild;
		while (menuElement) {
			const menubarItem = menuElement.firstElementChild;
			if (menuElement && menubarItem && menubarItem.tagName !== 'A') {
				throw new Error(`${msgPrefix} has child elements are not A elements.`);
			}
			menuElement = menuElement.nextElementSibling;
		}
	}
}
