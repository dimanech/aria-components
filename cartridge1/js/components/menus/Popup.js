import PopupMenu from './PopupMenu.js';

const keyCode = Object.freeze({
	TAB: 9,
	RETURN: 13,
	ESC: 27,
	SPACE: 32,
	UP: 38,
	DOWN: 40
});

export default class Popup {
	/*
	 * This content is based on w3.org design pattern examples and licensed according to the
	 * W3C Software License at
	 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
	 * Please see specification:
	 * https://www.w3.org/TR/wai-aria-practices/#menubutton
	 */
	constructor(domNode) {
		this.domNode = domNode; // need to call node from child
		this.popupButton = this.domNode;
		this.popupMenu = false;

		this.isMenubarItem = false;

		this.hasFocus = false;
		this.hasHover = false;

		this.closeDelay = 90;
	}

	init() {
		this.initEventListeners();
		const controlledElement = document.getElementById(this.popupButton.getAttribute('aria-controls'));

		this.popupMenu = new PopupMenu(controlledElement, this);
		this.popupMenu.init();

		this.setPopupPosition();
	}

	initEventListeners() {
		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleMouseenter = this.handleMouseenter.bind(this);
		this.handleMouseleave = this.handleMouseleave.bind(this);

		this.popupButton.addEventListener('mouseenter', this.handleMouseenter);
		this.popupButton.addEventListener('mouseleave', this.handleMouseleave);
		this.popupButton.addEventListener('keydown', this.handleKeydown);
		this.popupButton.addEventListener('focus', this.handleFocus);
		this.popupButton.addEventListener('blur', this.handleBlur);
	}

	removeEventListeners() {
		this.popupButton.removeEventListener('mouseenter', this.handleMouseenter);
		this.popupButton.removeEventListener('mouseleave', this.handleMouseleave);
		this.popupButton.removeEventListener('keydown', this.handleKeydown);
		this.popupButton.removeEventListener('focus', this.handleFocus);
		this.popupButton.removeEventListener('blur', this.handleBlur);
	}

	toggleExpanded(isExpanded) {
		this.popupButton.setAttribute('aria-expanded', isExpanded);
	}

	setPopupPosition() {
		const buttonBottom = this.popupButton.offsetTop + this.popupButton.clientHeight;
		const buttonCenter = this.popupButton.offsetLeft + (this.popupButton.clientWidth / 2);

		this.popupMenu.domNode.style.top = `${buttonBottom + 14}px`;
		this.popupMenu.domNode.querySelector('.popup-menu__tail').style.left = `${buttonCenter}px`;
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.SPACE:
			case keyCode.RETURN:
			case keyCode.DOWN:
				this.popupMenu.open();
				this.waitForTransitionEnd(() => this.popupMenu.setFocusToFirstItem());
				preventEventActions = true;
				break;

			case keyCode.UP:
				this.popupMenu.open();
				this.waitForTransitionEnd(() => this.popupMenu.setFocusToLastItem());
				preventEventActions = true;
				break;

			case keyCode.TAB:
			case keyCode.ESC:
				this.popupMenu.close(true);
				break;

			default:
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	handleMouseenter() {
		this.hasHover = true;
		this.popupMenu.open();
		this.setPopupPosition();
		clearTimeout(this.closeDelayTimer);
	}

	handleMouseleave() {
		this.hasHover = false;
		const closePopup = () => {
			if (!this.popupMenu.hasHover) {
				this.popupMenu.close();
			}
		};
		this.closeDelayTimer = setTimeout(closePopup, this.closeDelay);
	}

	handleFocus() {
		this.hasFocus = true;
		clearTimeout(this.blurDelayTimer);
	}

	handleBlur() {
		this.hasFocus = false;
		const closePopup = () => {
			if (!this.popupMenu.hasFocus) {
				this.popupMenu.close();
			}
		};
		this.blurDelayTimer = setTimeout(closePopup, this.closeDelay);
	}

	waitForTransitionEnd(callback) {
		const onEnd = () => {
			clearTimeout(this.transitionFallbackTimer);
			this.popupMenu.domNode.removeEventListener('transitionend', onEnd);
			callback();
		}
		this.popupMenu.domNode.addEventListener('transitionend', onEnd);
		this.transitionFallbackTimer = setTimeout(onEnd, 800);
	}

	destroy() {
		this.removeEventListeners();
		this.popupMenu.destroy();
		clearTimeout(this.closeDelayTimer);
		clearTimeout(this.blurDelayTimer);
		clearTimeout(this.transitionFallbackTimer);
	}
}
