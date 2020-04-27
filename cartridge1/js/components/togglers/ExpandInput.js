import Expand from './Expand.js';

const keyCode = Object.freeze({
	ESC: 27
});

export default class ExpandInput extends Expand {
	constructor(domNode) {
		super(domNode);
		this.handleEscape = this.handleEscape.bind(this);
	}

	toggle(isOpen) {
		super.toggle(isOpen);

		if (isOpen) {
			this.input = this.controledElement.querySelector('input');
			if (!this.input) {
				return;
			}
			this.input.addEventListener('keyup', this.handleEscape);
			this.input.focus();
		} else {
			if (this.input) {
				this.input.removeEventListener('keyup', this.handleEscape);
			}
			this.button.focus();
		}
	}

	handleEscape(event) {
		if (event.keyCode === keyCode.ESC) {
			this.toggle(!this.isOpen);
		}
	}
}
