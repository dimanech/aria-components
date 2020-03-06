import PopupMenu from './PopupMenu.js';

export default class MenubarItem {
	/*
	 * This content is based on w3.org design pattern examples
	 * and licensed according to the W3C Software License at
	 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
	 */
	constructor(domNode, menuObj) {
		this.isMenubarItem = true;
		this.menuBar = menuObj;
		this.domNode = domNode;
		this.wrapper = this.domNode.parentNode; // we need this to not deal with
		// timeouts for hovering from separate button to menu. This is not robust.
		this.popupMenu = null;

		this.hasFocus = false;
		this.hasHover = false;
		this.isPopUpExpanded = false;

		this.mouseOutTimeout = 30;

		this.cssClassNames = {
			hover: '_hover'
		};

		this.keyCode = Object.freeze({
			TAB: 9,
			RETURN: 13,
			ESC: 27,
			SPACE: 32,
			PAGEUP: 33,
			PAGEDOWN: 34,
			END: 35,
			HOME: 36,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40
		});
	}

	init() {
		this.domNode.tabIndex = -1;
		this.initEventListeners();

		// Initialize pop up menus
		const nextElement = this.domNode.nextElementSibling;
		if (nextElement && nextElement.hasAttribute('role', 'menu')) {
			this.popupMenu = new PopupMenu(nextElement, this);
			this.popupMenu.init();
		}
	}

	initEventListeners() {
		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleMouseover = this.handleMouseover.bind(this);
		this.handleMouseout = this.handleMouseout.bind(this);

		this.domNode.addEventListener('keydown', this.handleKeydown);
		this.domNode.addEventListener('focus', this.handleFocus);
		this.domNode.addEventListener('blur', this.handleBlur);
		this.wrapper.addEventListener('mouseenter', this.handleMouseover);
		this.wrapper.addEventListener('mouseleave', this.handleMouseout);
	}

	handleKeydown(event) { // eslint-disable-line complexity
		let preventEventActions = false;

		switch (event.keyCode) {
			case this.keyCode.SPACE:
			case this.keyCode.RETURN:
			case this.keyCode.DOWN:
				if (this.popupMenu) {
					this.popupMenu.open();
					this.popupMenu.setFocusToFirstItem(); // NB. This will not work on transformed elements
					preventEventActions = true;
				}
				break;

			case this.keyCode.LEFT:
				this.menuBar.setFocusToPreviousItem(this);
				preventEventActions = true;
				break;

			case this.keyCode.RIGHT:
				this.menuBar.setFocusToNextItem(this);
				preventEventActions = true;
				break;

			case this.keyCode.UP:
				if (this.popupMenu) {
					this.popupMenu.open();
					this.popupMenu.setFocusToLastItem(); // NB. This will not work on transformed elements
					preventEventActions = true;
				}
				break;

			case this.keyCode.HOME:
			case this.keyCode.PAGEUP:
				this.menuBar.setFocusToFirstItem();
				preventEventActions = true;
				break;

			case this.keyCode.END:
			case this.keyCode.PAGEDOWN:
				this.menuBar.setFocusToLastItem();
				preventEventActions = true;
				break;

			case this.keyCode.TAB:
				if (this.popupMenu) {
					this.popupMenu.close(true);
				}
				break;

			case this.keyCode.ESC:
				if (this.popupMenu) {
					this.popupMenu.close(true);
				}
				break;

			default:
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	setExpanded(isExpanded) {
		this.domNode.setAttribute('aria-expanded', isExpanded);
		this.isPopUpExpanded = isExpanded;

		if (isExpanded) {
			const contentHeight = this.popupMenu.domNode.clientHeight;
			this.menuBar.toggleFlyout(contentHeight);
		} else {
			this.menuBar.toggleFlyout(0);
		}
	}

	handleFocus() {
		this.menuBar.hasFocus = true;
	}

	handleBlur() {
		this.menuBar.hasFocus = false;
	}

	handleMouseover() {
		if (this.hasHover) {
			return;
		}

		this.hasHover = true;
		if (this.menuBar.hasHover && this.popupMenu) {
			// Need timeout to improve UX
			setTimeout(() => this.popupMenu.open(), this.mouseOutTimeout);
		}
		if (this.menuBar.hasHover) {
			this.domNode.classList.add(this.cssClassNames.hover);
		}
	}

	handleMouseout() {
		this.hasHover = false;
		if (this.popupMenu) {
			// fired twice since menu also handle mouseout and close menu
			setTimeout(() => this.popupMenu.close(), this.mouseOutTimeout);
		}
		this.domNode.classList.remove(this.cssClassNames.hover);
	}

	destroy() {
		this.domNode.removeEventListener('keydown', this.handleKeydown);
		this.domNode.removeEventListener('focus', this.handleFocus);
		this.domNode.removeEventListener('blur', this.handleBlur);
		this.domNode.removeEventListener('mouseenter', this.handleMouseover);
		this.domNode.removeEventListener('mouseleave', this.handleMouseout);

		if (this.popupMenu) {
			this.popupMenu.destroy();
		}
	}
};
