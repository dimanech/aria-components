export default class Form {
	constructor(form) {
		this.form = form;
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		this.onInvalid = this.onInvalid.bind(this);
		this.onChange = this.onChange.bind(this);

		[...this.form.elements].forEach(element => {
			element.addEventListener('invalid', this.onInvalid);
			element.addEventListener('change', this.onChange);
		});
	}

	onChange(event) {
		const element = event.target;
		if (this.isOnChangeValidation) {
			this.toggleValidityNotification(element, element.reportValidity());
		}
	}

	onInvalid(event) {
		event.preventDefault();
		this.toggleValidityNotification(event.target, false);
		this.focusFirstError();
		this.isOnChangeValidation = true;
	}

	toggleValidityNotification(element, isValid) {
		element.style.borderColor = isValid ? 'green' : 'red';
		this.toggleMessage(element, element.validationMessage, isValid);
	}

	focusFirstError() {
		this.form.querySelector('*:invalid').focus();
	}

	toggleMessage(element, message, isValid) {
		const wrapper = element.parentElement;
		const error = wrapper.querySelector('[data-elem-form-error]');

		if (isValid) {
			error.setAttribute('hidden', true);
		} else {
			error.innerText = message;
			error.removeAttribute('hidden');
		}
	}

	destroy() {
		[...this.form.elements].forEach(element => {
			element.removeEventListener('invalid', this.onInvalid);
			element.removeEventListener('change', this.onChange);
		});
	}
};
