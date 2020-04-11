export default class InputUnmask {
	constructor(domNode) {
		this.button = domNode;
		this.inputs = this.getPasswordInputs();
		this.label = this.button.getAttribute('title');
		this.labelPressed = this.button.getAttribute('data-title-pressed');
		this.isInputMasked = true;
	}

	init() {
		if (!this.inputs.length) {
			return;
		}

		this.addEventListeners();
	}

	addEventListeners() {
		this.toggleMasking = this.toggleMasking.bind(this);
		this.button.addEventListener('click', this.toggleMasking);
	}

	getPasswordInputs() {
		let result = [];

		const inputs = this.button.getAttribute('data-inputs')
				.replace(/\s/, '')
				.split(',');
		inputs.forEach(id => result.push(document.getElementById(id)));

		return result;
	}

	toggleMasking() {
		this.isInputMasked = this.isInputMasked !== true;

		this.inputs.forEach(input => {
			input.setAttribute('type', this.isInputMasked ? 'password' : 'text');
			input.setAttribute('autocomplete', this.isInputMasked ? 'current-password' : 'off');
		});

		this.button.setAttribute('aria-pressed', !this.isInputMasked);
		this.button.setAttribute('title', this.isInputMasked ? this.label : this.labelPressed);
	}
}
