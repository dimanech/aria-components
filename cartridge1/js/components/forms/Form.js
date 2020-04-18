import { closest } from '../../utils/dom.js';

// TODO: disabled inputs should not have validation?

export default class Form {
	constructor(domNode) {
		this.form = domNode;
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		this.onInvalid = this.onInvalid.bind(this);
		this.checkValidity = this.checkValidity.bind(this);
		this.onSubmit = this.onSubmit.bind(this);

		[...this.form.elements].forEach(element => {
			element.addEventListener('invalid', this.onInvalid);
			element.addEventListener('change', this.checkValidity);
			if (element.getAttribute('type') === 'submit') {
				element.addEventListener('click', this.onSubmit);
			}
		});
		this.form.addEventListener('input:checkValidity', this.checkValidity);
		this.form.addEventListener('submit', this.onSubmit);
		// onreset remove all error messages?
	}

	checkValidity(event) {
		const element = event.target;
		if (this.isOnChangeValidation) {
			this.toggleValidityNotification(element, element.checkValidity());
		}
	}

	onInvalid(event) {
		event.preventDefault();
		this.toggleValidityNotification(event.target, false);
		this.isOnChangeValidation = true;
	}

	onSubmit() {
		// this is click on submit, because submit never fired until all fields would be valid
		if(!this.form.reportValidity()) {
			this.focusFirstError();
		}
	}

	toggleValidityNotification(element, isValid) {
		// we need some custom style or attribute because invalid state and CSS :invalid
		// triggered on page load, components init - that is not very pretty
		element.setAttribute('aria-invalid', !isValid);
		this.toggleMessage(element, this.getCustomErrorMessage(element), isValid);
	}

	focusFirstError() {
		this.form.querySelector('*:invalid').focus();
	}

	toggleMessage(element, message, isValid) {
		const wrapper = closest(element, 'data-elem-field');
		const error = wrapper.querySelector('[data-elem-field-error]');
		if (!error) {
			return;
		}

		if (isValid) {
			error.setAttribute('hidden', true);
		} else {
			error.innerText = message;
			error.removeAttribute('hidden');
		}
	}

	getCustomErrorMessage(element) {
		// https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
		let validationMessage = '';

		// get first true error and check if we have message

		switch (true) {
			case (element.validity.customError
					&& element.getAttribute('data-error-custom')):
				validationMessage = element.validationMessage;
				break;
			case (element.validity.valueMissing
					&& element.getAttribute('data-error-missing')):
				validationMessage = element.getAttribute('data-error-missing');
				break;
			case (element.validity.patternMismatch || element.validity.typeMismatch)
					&& element.getAttribute('data-error-mismatch-pattern'):
				validationMessage = element.getAttribute('data-error-mismatch');
				break;
			case (element.validity.tooLong || element.validity.tooShort || element.validity.rangeOverflow || element.validity.rangeUnderflow)
					&& element.getAttribute('data-error-range'):
				validationMessage = element.getAttribute('data-error-range');
				break;
			default:
				validationMessage = element.validationMessage;
		}

		return validationMessage;
	}

	destroy() {
		[...this.form.elements].forEach(element => {
			element.removeEventListener('invalid', this.onInvalid);
			element.removeEventListener('change', this.checkValidity);
			if (element.getAttribute('type') === 'submit') {
				element.removeEventListener('click', this.onSubmit);
			}
		});
		this.form.removeEventListener('input:checkValidity', this.checkValidity);
		this.form.removeEventListener('submit', this.onSubmit);
	}
};
