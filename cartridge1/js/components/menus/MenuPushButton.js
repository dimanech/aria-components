const keyCode = Object.freeze({
	TAB: 9,
	RETURN: 13,
	ESC: 27,
	SPACE: 32,
	UP: 38,
	DOWN: 40
});

export default class MenuPushButton {
	constructor(domNode) {
		this.domNode = domNode; // need to call node from child
		this.popupButton = this.domNode;
		this.menu = false;

		this.isMenubarItem = false;

		this.hasFocus = false;
		this.hasHover = false;

		this.animationDelay = 200;

		this.controlledElement = null;
		this.menu = null;
	}

	init() {
		this.initEventListeners();
		this.controlledElement = document.getElementById(this.popupButton.getAttribute('aria-controls'));
	}

	initEventListeners() {
		this.handleKeydown = this.handleKeydown.bind(this);

		this.popupButton.addEventListener('keydown', this.handleKeydown);
	}

	removeEventListeners() {
		this.popupButton.removeEventListener('keydown', this.handleKeydown);
	}

	setExpanded(isExpanded) {
		this.popupButton.setAttribute('aria-expanded', isExpanded.toString());
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.SPACE:
			case keyCode.RETURN:
			case keyCode.DOWN:
				this.menu.open();
				this.timeout = setTimeout(() => this.menu.setFocusToFirstItem(), this.animationDelay);
				preventEventActions = true;
				break;

			case keyCode.UP:
				this.menu.open();
				this.timeout = setTimeout(() => this.menu.setFocusToLastItem, this.animationDelay);
				preventEventActions = true;
				break;

			case keyCode.TAB:
			case keyCode.ESC:
				this.menu.close(true);
				break;

			default:
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	destroy() {
		this.removeEventListeners();
		clearTimeout(this.timeout);
		this.menu.destroy();
	}
}
