import Form from './Form.js';
import { submitFormJson } from '../../utils/ajax.js';

export default class FormAjax extends Form {
	constructor(domNode) {
		super(domNode);
		this.methodType = this.form.getAttribute('method') === 'GET' ? 'GET' : 'POST';
		this.formURL = this.form.getAttribute('action');
	}

	onSubmit(event) {
		event.preventDefault();

		if (this.isBusy) {
			return false;
		}
		this.toggleBusy(true);
		this.setFormError('');

		submitFormJson(this.formURL, this.serializeForm(), this.methodType)
			.then(this.onSubmitted.bind(this))
			.finally(() => this.toggleBusy(false));
	}

	destroy() {
		super.destroy();
	}

	onSubmitted(data) {
		if (data.success && data.redirectUrl) {
			window.location.assign(data.redirectUrl);
		} else if (data.error) {
			this.setFormError(Array.isArray(data.error) ? data.error.join('\n') : data.error);
		} else if (data.fields) {
			Object.entries(data.fields).forEach(([name, errorMsg]) => {
				const formElement = this.form.querySelector(`[name=${name}]`);
				formElement.setCustomValidity(errorMsg);
				this.toggleValidityNotification(formElement, false);
			});
		} else {
			this.form.dispatchEvent(new Event('form:submitted', { bubbles: true }));
		}
	}

	serializeForm() {
		const formData = new FormData(this.form);
		return JSON.stringify(Object.fromEntries(formData));
	}

	toggleBusy(isBusy) {
		this.isBusy = false;
		this.form.toggleAttribute('aria-busy', isBusy);
	}

	setFormError(msg, msg2) {
		const formError = this.form.querySelector('[data-element-form-error]');
		const message = msg2 || msg;
		if (message !== '') {
			formError.innerText = message;
			formError.removeAttribute('hidden');
		} else {
			formError.innerText = '';
			formError.setAttribute('hidden', 'true');
		}
	}
}
