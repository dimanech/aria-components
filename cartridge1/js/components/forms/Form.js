import { closest } from '../../utils/dom.js';

export default class Form {
	constructor(form) {
		this.form = form;
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
	}

	checkValidity(event) {
		event.stopPropagation();
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
		element.style.borderColor = isValid ? 'green' : 'red';
		this.toggleMessage(element, this.getCustomErrorMessage(element), isValid);
	}

	focusFirstError() {
		this.form.querySelector('*:invalid').focus();
	}

	toggleMessage(element, message, isValid) {
		const wrapper = closest(element, 'form-item');
		const error = wrapper.querySelector('[data-elem-form-error]');
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
		// [badInput, customError, patternMismatch, rangeOverflow, rangeUnderflow, stepMismatch, tooLong, tooShort, typeMismatch, valueMissing]

		let validationMessage = element.validationMessage;

		if (element.validity.patternMismatch && element.getAttribute('data-error-mismatch-pattern')) {
			validationMessage = element.getAttribute('data-error-mismatch-pattern');
		}
		if ((element.validity.rangeOverflow || element.validity.rangeUnderflow) && element.getAttribute('data-error-range')) {
			validationMessage = element.getAttribute('data-error-range');
		}
		if ((element.validity.tooLong || element.validity.tooShort) && element.getAttribute('data-error-range')) {
			validationMessage = element.getAttribute('data-error-range');
		}
		if (element.validity.valueMissing && element.getAttribute('data-error-missing')) {
			validationMessage = element.getAttribute('data-error-missing');
		}
		if (element.validity.typeMismatch && element.getAttribute('data-error-mismatch-type')) {
			validationMessage = element.getAttribute('data-error-mismatch-type');
		}
		if (element.getAttribute('data-error-custom')) {
			validationMessage = element.getAttribute('data-error-custom');
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
	}
};
