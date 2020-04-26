import MenuBarPopupMenu from './MenuBarPopupMenu.js';

const keyCode = Object.freeze({
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

export default class MenuBarPopup {
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

		this.mouseOutDelay = 30;
		this.cssClassHover = '_hover';
	}

	init() {
		this.domNode.tabIndex = -1;
		this.initEventListeners();
		this.initPopUpMenus();
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

	removeEventListeners() {
		this.domNode.removeEventListener('keydown', this.handleKeydown);
		this.domNode.removeEventListener('focus', this.handleFocus);
		this.domNode.removeEventListener('blur', this.handleBlur);
		this.domNode.removeEventListener('mouseenter', this.handleMouseover);
		this.domNode.removeEventListener('mouseleave', this.handleMouseout);
	}

	initPopUpMenus() {
		const nextElement = this.domNode.nextElementSibling;
		if (nextElement) {
			this.popupMenu = new MenuBarPopupMenu(nextElement, this);
			this.popupMenu.init();
		}
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.SPACE:
			case keyCode.RETURN:
			case keyCode.DOWN:
				if (this.popupMenu) {
					this.popupMenu.open();
					this.popupMenu.setFocusToFirstItem(); // wait for animation in case if animated otherwise would not gain focus
					preventEventActions = true;
				}
				break;

			case keyCode.UP:
				if (this.popupMenu) {
					this.popupMenu.open();
					this.popupMenu.setFocusToLastItem(); // wait for animation in case if animated otherwise would not gain focus
					preventEventActions = true;
				}
				break;

			case keyCode.LEFT:
				this.menuBar.setFocusToPreviousItem(this);
				preventEventActions = true;
				break;

			case keyCode.RIGHT:
				this.menuBar.setFocusToNextItem(this);
				preventEventActions = true;
				break;

			case keyCode.HOME:
			case keyCode.PAGEUP:
				this.menuBar.setFocusToFirstItem();
				preventEventActions = true;
				break;

			case keyCode.END:
			case keyCode.PAGEDOWN:
				this.menuBar.setFocusToLastItem();
				preventEventActions = true;
				break;

			case keyCode.ESC:
			case keyCode.TAB:
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

	toggleExpanded(isExpanded) {
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
			this.hoverTimeout = setTimeout(() => this.popupMenu.open(), this.mouseOutDelay);
		}
		if (this.menuBar.hasHover) {
			this.domNode.classList.add(this.cssClassHover);
		}
	}

	handleMouseout() {
		this.hasHover = false;

		if (this.popupMenu) {
			// fired twice since menu also handle mouseout and close menu
			this.hoverTimer = setTimeout(() => this.popupMenu.close(), this.mouseOutDelay);
		}
		this.domNode.classList.remove(this.cssClassHover);
	}

	destroy() {
		this.removeEventListeners();
		clearTimeout(this.hoverTimer);
		if (this.popupMenu) {
			this.popupMenu.destroy();
		}
	}
}
