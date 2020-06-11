/*
 * Since we could not get software keyboard height on iOS we just close keyboard on touch out from input
 */
export default class inputKdbToggle {
	constructor(domNode) {
		this.input = domNode;

		if ('ontouchstart' in document.documentElement) {
			this.addEventListeners();
		}
	}

	addEventListeners() {
		this.hideKdb = this.hideKdb.bind(this);
		this.focusHandler = this.focusHandler.bind(this);
		this.blurHandler = this.blurHandler.bind(this);

		this.input.addEventListener('focus', this.focusHandler);
		this.input.addEventListener('blur', this.blurHandler);
	}

	hideKdb() {
		this.input.closest('[role=dialog]').focus();
	}

	focusHandler() {
		document.addEventListener('touchstart', this.hideKdb);
	}

	blurHandler() {
		document.removeEventListener('touchstart', this.hideKdb);
	}
}
