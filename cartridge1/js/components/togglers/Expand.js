const keyCode = Object.freeze({
	RETURN: 13,
	SPACE: 32
});

export default class Expand {
	/**
	 * Expand (Disclosure / Summary)
	 * This is expand button implementation that could be used for several different
	 * cases like disclosure / summary / "see more" component (show-hide), panel control button etc.
	 * Please see W3C specs https://www.w3.org/TR/wai-aria-practices/#disclosure
	 *
	 * @param {HTMLElement} domNode - toggle button with `aria-controls`
	 * @example
	 * <button aria-expanded="false" aria-controls="more-details">Read more...</button>
	 * <div id="more-details">Lorem ipsum...</div>
	 */
	constructor(domNode) {
		this.button = domNode;
		this.isOpen = false;
		this.keyCode = keyCode;
	}

	init() {
		this.controledElement = document.getElementById(this.button.getAttribute('aria-controls'));
		if (!this.controledElement) {
			return;
		}
		this.addEventListeners();
		this.initState();
	}

	destroy() {
		this.removeEventListeners();
		this.destroyState();
	}

	addEventListeners() {
		this.handleClick = this.handleClick.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleKeyup = this.handleKeyup.bind(this);

		this.button.addEventListener('click', this.handleClick);
		this.button.addEventListener('keydown', this.handleKeydown);
		this.button.addEventListener('keyup', this.handleKeyup);
	}

	removeEventListeners() {
		this.button.removeEventListener('click', this.handleClick);
		this.button.removeEventListener('keydown', this.handleKeydown);
		this.button.removeEventListener('keyup', this.handleKeyup);
	}

	initState() {
		this.toggle(this.button.getAttribute('aria-expanded') === 'true');
	}

	destroyState() {
		this.button.removeAttribute('aria-expanded');
		this.controledElement.removeAttribute('aria-hidden');
	}

	handleClick(event) {
		event.preventDefault();
		this.toggle(!this.isOpen);
	}

	toggle(isOpen) {
		this.button.setAttribute('aria-expanded', isOpen);
		this.controledElement.setAttribute('aria-hidden', !isOpen);
		this.button.dispatchEvent(new Event(isOpen ? 'toggle:open' : 'toggle:close'));
		this.isOpen = !!isOpen;
	}

	handleKeydown(event) {
		const key = event.keyCode;
		if (key === this.keyCode.SPACE || key === this.keyCode.RETURN) {
			event.stopPropagation();
			event.preventDefault();
			this.toggle(!this.isOpen);
		}
	}

	handleKeyup(event) {
		const key = event.keyCode;
		// FF fires click event on button node after keyup
		if (key === this.keyCode.SPACE || key === this.keyCode.RETURN) {
			event.preventDefault();
		}
	}
}
