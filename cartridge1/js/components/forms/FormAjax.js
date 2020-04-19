import Form from './Form.js';
import { submitFormJson } from '../../utils/fetch.js';

export default class FormAjax extends Form {
	constructor(domNode) {
		super(domNode);
		this.action = this.form.action;
		this.method = this.form.method.toUpperCase();
		this.enctype = this.form.enctype || (this.form.enctype = 'application/x-www-form-urlencoded');
	}

	init() {
		if (!this.action) {
			return;
		}
		super.init();
	}

	onSubmit(event) {
		super.onSubmit();

		event.preventDefault();

		if (this.isBusy) {
			return false;
		}
		this.toggleBusy(true);
		this.setFormError('');

		submitFormJson(this.action, this.getFormData(), this.method)
			.then(this.handleResponse.bind(this))
			.finally(() => this.toggleBusy(false));
	}

	handleResponse(data) {
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
			this.onSuccess();
		}
	}

	getFormData() {
		const formData = new FormData(this.form);
		return Object.fromEntries(formData);
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
			formError.scrollIntoView();
		} else {
			formError.innerText = '';
			formError.setAttribute('hidden', 'true');
		}
	}

	onSuccess() {
		this.form.dispatchEvent(new Event('form:submitted', { bubbles: true }));
	}

	destroy() {
		super.destroy();
	}
}
