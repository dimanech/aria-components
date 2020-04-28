export default class InputCompareWith {
	constructor(domNode) {
		this.input = domNode;
		this.referenceInput = document.getElementById(this.input.getAttribute('data-compare-with'));
		this.errorMessage = this.input.getAttribute('data-error-custom');
	}

	init() {
		if (!this.referenceInput) {
			return;
		}

		this.addEventListeners();
	}

	addEventListeners() {
		this.onChange = this.onChange.bind(this);
		this.input.addEventListener('change', this.onChange);
		this.referenceInput.addEventListener('change', this.onChange);
	}

	onChange() {
		if (!this.input.value) {
			return; // do not validate if user do not enter anything in second input
		}
		this.referenceInput.setCustomValidity(!this.isInputsEqual() ? this.errorMessage : '');
		this.referenceInput.checkValidity();
		this.referenceInput.dispatchEvent(new Event('input:checkValidity', { bubbles: true }));
	}

	isInputsEqual() {
		return this.input.value === this.referenceInput.value;
	}
}
