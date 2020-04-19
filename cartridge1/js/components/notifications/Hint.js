const keyCode = Object.freeze({
	ESC: 27
});

export default class Hint {
	// Partially this is covered by https://www.w3.org/TR/wai-aria-practices/#tooltip
	constructor(domNode) {
		this.hint = domNode;
		this.elementsWithHint = [];
		this.isHintShown = false;
		this.timeout = 1000;

		this.initHint = this.initHint.bind(this);
		this.hideHint = this.hideHint.bind(this);
	}

	init() {
		this.addEventListeners();
	}

	reinit() {
		// add mutation observer
		this.addEventListenersToElement();
	}

	addEventListeners() {
		this.handleEscape = this.handleEscape.bind(this);
		document.addEventListener('keyup', this.handleEscape);

		this.addEventListenersToElement();
	}

	addEventListenersToElement() {
		document.querySelectorAll('[data-hint]').forEach(element => {
			if (this.elementsWithHint.indexOf(element) !== -1) {
				return;
			}

			element.addEventListener('mouseenter', this.initHint);
			element.addEventListener('mouseout', this.hideHint);
			this.elementsWithHint.push(element);
		});
	}

	initHint(event) {
		this.hintTarget = event.target;
		this.hintContent = this.hintTarget.getAttribute('data-hint');
		if (!this.hintContent) {
			return;
		}

		if (this.isHintingMode) {
			this.showHint();
		} else {
			this.showTimer = window.setTimeout(this.showHint.bind(this), this.timeout);
		}
	}

	showHint() {
		this.enableHintMode();
		this.hint.innerText = this.hintContent;
		this.positionateHint();
		this.hint.classList.add('_shown');
		this.isHintShown = true;
	}

	hideHint() {
		if (this.showTimer) {
			window.clearTimeout(this.showTimer);
		}

		this.hint.classList.remove('_shown');
		this.hint.classList.remove('_not-centered');
		this.hint.innerText = '';
		this.hint.style.left = 'initial';
		this.hint.style.top = 'initial';
		this.hint.style.bottom = 'initial';
		this.isHintShown = false;

		if (this.isHintingMode) {
			this.hintingModeOffTimer = window.setTimeout(this.disableHintMode.bind(this), this.timeout);
		}
	}

	enableHintMode() {
		this.isHintingMode = true;
		if (this.hintingModeOffTimer) {
			window.clearTimeout(this.hintingModeOffTimer);
		}
	}

	disableHintMode() {
		this.isHintingMode = false;
	}

	positionateHint() {
		const targetRectangle = this.hintTarget.getBoundingClientRect();
		const targetWidth = targetRectangle.right - targetRectangle.left;
		const margin = 5;
		const hintMaxWidth = 120;

		if (hintMaxWidth > targetWidth) {
			const offset = (hintMaxWidth - targetWidth) / 2;
			switch (true) {
				case (targetRectangle.right + offset >= window.innerWidth): // near right edge
					this.hint.style.left = targetRectangle.right - hintMaxWidth + 'px';
					this.hint.classList.add('_not-centered');
					break;
				case (targetRectangle.left - offset <= 0): // near left edge
					this.hint.style.left = targetRectangle.left + 'px';
					this.hint.classList.add('_not-centered');
					break;
				default:
					this.hint.style.left = targetRectangle.left + (targetWidth / 2) + 'px';
			}
		} else {
			this.hint.style.left = targetRectangle.left + (targetWidth / 2) + 'px';
		}

		this.hint.style.maxWidth = hintMaxWidth + 'px';

		if (targetRectangle.bottom + 40 > window.innerHeight) {
			const targetHeight = targetRectangle.top - targetRectangle.bottom;
			const heightToBottom = window.innerHeight - targetRectangle.bottom;
			this.hint.style.bottom = (heightToBottom - targetHeight) + margin + 'px';
		} else {
			this.hint.style.top = targetRectangle.bottom + margin + 'px';
		}
	}

	handleEscape(event) {
		if (event.keyCode === keyCode.ESC && this.isHintShown) {
			this.hideHint();
		}
	}

	destroy() {
		document.removeEventListener('keyup', this.handleEscape);

		this.elementsWithHint.forEach(element => {
			element.removeEventListener('mouseenter', this.initHint);
			element.removeEventListener('mouseout', this.hideHint);
		});
		this.elementsWithHint = [];

		if (this.showTimer) {
			window.clearTimeout(this.showTimer);
		}
	}
}
