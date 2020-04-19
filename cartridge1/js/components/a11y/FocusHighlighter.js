export default class FocusHighlighter {
	constructor(highlighterDomNode) {
		this.highlighter = highlighterDomNode;

		this.keyCode = Object.freeze({
			TAB: 9,
			RETURN: 13,
			ESC: 27,
			SPACE: 32,
			PAGEUP: 33,
			PAGEDOWN: 34,
			END: 35,
			HOME: 36,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40
		});

		this.keyboardModality = false;
		this.isHighlighterVisible = false;
		this.lastFocusedElement = null;

		this.handleClick = this.handleClick.bind(this);
		this.handleKeyup = this.handleKeyup.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleFocusin = this.focus.bind(this);
	}

	init() {
		this.initEventListeners();
		document.body.classList.add('js-highlighter-inited');
	}

	initEventListeners() {
		document.addEventListener('keyup', this.handleKeyup);
		document.addEventListener('click', this.handleClick);
		window.addEventListener('resize', this.handleResize);
	}

	handleKeyup(e) {
		switch (e.keyCode) {
			case this.keyCode.TAB:
				this.keyboardModality = true;
				this.focus();
				document.addEventListener('focusin', this.handleFocusin);
				// all other events are handled by focusin event
				break;
			case this.keyCode.ESC:
				this.blur();
				document.removeEventListener('focusin', this.handleFocusin);
				break;
			default:
		}
	}

	handleClick(event) {
		// Space keyup on button DomNode generates synthetic click
		// so we need to ensure that it is not the one
		if (this.isHighlighterVisible && !(event.x === 0 && event.y === 0)) {
			this.blur();
			document.removeEventListener('focusin', this.handleFocusin);
		}
	}

	handleResize() {
		if (this.isHighlighterVisible) {
			this.blur();
		}
	}

	focus() {
		const focusedElement = document.activeElement;

		if (!this.isValidTarget(focusedElement) ||
            (FocusHighlighter.isTextInput(focusedElement) && !this.keyboardModality)) {
			return;
		}

		this.detectHurryNavigation();
		this.moveHighlighterTo(focusedElement);
		this.lastFocusedElement = focusedElement;
	}

	blur() {
		this.hideHighlighter();
		this.keyboardModality = false;
		this.lastFocusedElement = null;
	}

	moveHighlighterTo(focusedElement) {
		window.clearTimeout(this.hideTimeOut);

		const highlighterStyle = this.highlighter.style;
		highlighterStyle.top = `${focusedElement.getBoundingClientRect().top + window.scrollY - 1}px`;
		highlighterStyle.left = `${focusedElement.getBoundingClientRect().left + window.scrollX - 1}px`;
		highlighterStyle.width = `${focusedElement.offsetWidth + 2}px`;
		highlighterStyle.height = `${focusedElement.offsetHeight + 2}px`;

		this.highlighter.classList.add('m-visible');
		this.isHighlighterVisible = true;
	}

	hideHighlighter() {
		this.hideTimeOut = window.setTimeout(() => {
			const highlighterStyle = this.highlighter.style;
			highlighterStyle.width = '0';
			highlighterStyle.height = '0';
		}, 600);

		this.highlighter.classList.remove('m-visible');
		this.isHighlighterVisible = false;
	}

	detectHurryNavigation() {
		const currentTime = Date.now();

		if (currentTime - this.lastKeyTime < 190) {
			this.highlighter.classList.add('m-hurry');
			this.isHurryNavigation = true;
		} else if (this.isHurryNavigation) {
			this.highlighter.classList.remove('m-hurry');
			this.isHurryNavigation = false;
		}

		this.lastKeyTime = currentTime;
	}

	isValidTarget(domNode) {
		return !!(domNode &&
            domNode !== this.lastFocusedElement &&
            domNode !== document &&
            domNode.nodeName !== 'HTML' &&
            domNode.nodeName !== 'BODY'
		);
	}

	static isTextInput(domNode) {
		return !!((domNode.tagName === 'TEXTAREA' && !domNode.readOnly) ||
            (domNode.tagName === 'INPUT' && !domNode.readOnly) ||
            domNode.getAttribute('contenteditable'));
	}
}
