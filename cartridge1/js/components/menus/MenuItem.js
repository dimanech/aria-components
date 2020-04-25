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

export default class MenuItem {
	/*
	 * This content is based on w3.org design pattern examples and licensed according to the
	 * W3C Software License at
	 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
	 */
	constructor(domNode, menuObj) {
		this.domNode = domNode;
		this.menu = menuObj;

		this.blurHandledByController = false;

		this.timeout = 20;

		this.cssClassNames = {
			active: '_active'
		};
	}

	init() {
		this.domNode.tabIndex = -1;
		this.initEventListeners();
	}

	initEventListeners() {
		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);

		this.domNode.addEventListener('keydown', this.handleKeydown);
		this.domNode.addEventListener('click', this.handleClick);
		this.domNode.addEventListener('focus', this.handleFocus);
		this.domNode.addEventListener('blur', this.handleBlur);
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.SPACE:
			case keyCode.RETURN:
				this.handleKeyReturn(event);
				preventEventActions = true;
				break;

			case keyCode.UP:
				this.menu.setFocusToPreviousItem(this);
				preventEventActions = true;
				break;

			case keyCode.DOWN:
				this.menu.setFocusToNextItem(this);
				preventEventActions = true;
				break;

			case keyCode.LEFT:
				this.handleKeyLeft();
				preventEventActions = true;
				break;

			case keyCode.RIGHT:
				this.handleKeyRight();
				preventEventActions = true;
				break;

			case keyCode.HOME:
			case keyCode.PAGEUP:
				this.menu.setFocusToFirstItem();
				preventEventActions = true;
				break;

			case keyCode.END:
			case keyCode.PAGEDOWN:
				this.menu.setFocusToLastItem();
				preventEventActions = true;
				break;

			case keyCode.ESC:
				this.menu.setFocusToController();
				preventEventActions = true;
				break;

			case keyCode.TAB:
				this.menu.setFocusToController();
				preventEventActions = true;
				break;

			default:
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	handleKeyReturn(event) {
		// Create simulated mouse event to mimic the behavior of ATs
		// and let the event handler handleClick do the housekeeping.
		let clickEvent;
		if (typeof MouseEvent === 'function') {
			clickEvent = new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			});
		} else if (document.createEvent) { // IE11<
			clickEvent = document.createEvent('MouseEvents');
			clickEvent.initEvent('click', true, true);
		}
		event.currentTarget.dispatchEvent(clickEvent);
		event.currentTarget.classList.add(this.cssClassNames.active);
	}

	handleKeyRight() {
		this.blurHandledByController = true; // blur and close handled in parent
		this.menu.setFocusToController('next', this);
	}

	handleKeyLeft() {
		this.blurHandledByController = true;
		this.menu.setFocusToController('previous', this);
	}

	handleClick() {
		this.domNode.classList.add(this.cssClassNames.active);
	}

	handleFocus() {
		this.menu.hasFocus = true;
	}

	handleBlur() {
		this.menu.hasFocus = false;
		this.domNode.tabIndex = -1;

		if (!this.blurHandledByController) {
			setTimeout(() => this.menu.close(), this.timeout);
			// We need this timeout to handle keyboard interaction between components.
			// When it blur some other will set focus. This checked in Menu.close. If no one
			// gained focus we close menu
		}
		this.blurHandledByController = false;
	}

	destroy() {
		this.domNode.tabIndex = 0;

		this.domNode.removeEventListener('keydown', this.handleKeydown);
		this.domNode.removeEventListener('click', this.handleClick);
		this.domNode.removeEventListener('focus', this.handleFocus);
		this.domNode.removeEventListener('blur', this.handleBlur);
	}
}
