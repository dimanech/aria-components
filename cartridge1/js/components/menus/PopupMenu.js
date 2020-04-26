import Menu from './Menu.js';

export default class PopupMenu extends Menu {
	/*
	 * This content is based on w3.org design pattern examples and licensed according to the
	 * W3C Software License at
	 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
	 * Please see specification:
	 * https://www.w3.org/TR/wai-aria-practices/#menubutton
	 */
	constructor(domNode, controllerComponent) {
		super(domNode, controllerComponent);

		this.mouseOutDelay = 200;
	}

	init() {
		super.init();
		this.initEventListeners();
	}

	initEventListeners() {
		this.handleMouseover = this.handleMouseover.bind(this);
		this.handleMouseout = this.handleMouseout.bind(this);

		this.domNode.addEventListener('mouseenter', this.handleMouseover);
		this.domNode.addEventListener('mouseleave', this.handleMouseout);
	}

	destroyEventListeners() {
		this.domNode.removeEventListener('mouseenter', this.handleMouseover);
		this.domNode.removeEventListener('mouseleave', this.handleMouseout);
	}

	setFocusToController(cmd) {
		const command = typeof cmd !== 'string' ? '' : cmd;

		if (command === '') {
			if (this.controller && this.controller.domNode) {
				// focus controller node and handle event on his side
				this.controller.domNode.focus();
			}
		}
	}

	open() {
		this.togglePopup(true);
	}

	close(isForce) {
		if (isForce) {
			this.togglePopup(false);
		}

		clearTimeout(this.mouseOutTimer);

		const hasFocusWithin = this.hasFocus || this.menuItems.some(item => item.popupMenu && item.popupMenu.hasFocus);
		const hasHoverOnController = this.controller.isMenubarItem ? this.controller.hasHover : false;

		if (!hasFocusWithin && !this.hasHover && !hasHoverOnController) {
			this.togglePopup(false);
		}
	}

	togglePopup(isOpen) {
		this.domNode.classList.toggle('_open', isOpen);
		this.domNode.setAttribute('aria-hidden', !isOpen);
		this.controller.toggleExpanded(isOpen);
	}

	handleMouseover() {
		this.hasHover = true;
	}

	handleMouseout() {
		this.hasHover = false;
		// Need timeout to improve UX. Note that controller should implement this timeout also.
		this.mouseOutTimer = setTimeout(() => this.close(), this.mouseOutDelay);
	}

	destroy() {
		super.destroy();
		this.destroyEventListeners();
		this.close(true);
		clearTimeout(this.mouseOutTimer);
	}
}
