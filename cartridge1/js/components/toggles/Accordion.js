// TODO: rename around 2 concepts Header and Panel

const keyCode = Object.freeze({
	RETURN: 13,
	SPACE: 32,
	END: 35,
	HOME: 36,
	UP: 38,
	DOWN: 40
});

export default class Accordion {
	/*
	 * Accordion
	 *
	 * An accordion is a vertically stacked set of interactive headings that each
	 * contain a title, content snippet, or thumbnail representing a section of content.
	 * The headings function as controls that enable users to reveal or hide their
	 * associated sections of content. Accordions are commonly used to reduce the
	 * need to scroll when presenting multiple sections of content on a single page.
	 *
	 * Please see W3C specs https://www.w3.org/TR/wai-aria-practices/#accordion
	 *
	 * Configuration:
	 * `data-allow-toggle` - Allow for each toggle to both open and close its section.
	 *  Makes it possible for all sections to be closed.
	 * `data-allow-multiple` - Allow for multiple accordion sections to be expanded
	 *  at the same time.
	 */
	constructor(domNode, config) {
		// elements
		this.group = domNode;
		this.buttons = Array.from(this.group.querySelectorAll('[aria-controls]'));
		// options
		this.options = {
			allowToggle: config?.allowToggle || Accordion.isAttributeSet(this.group.getAttribute('data-allow-toggle')),
			allowMultiple: config?.allowMultiple || Accordion.isAttributeSet(this.group.getAttribute('data-allow-multiple'))
		}
	}

	init() {
		this.addEventListeners();
		this.initSections();
	}

	destroy() {
		this.removeEventListeners();
		this.destroySection();
	}

	addEventListeners() {
		this.handleClick = this.handleClick.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleKeyup = this.handleKeyup.bind(this);

		this.buttons.forEach(button => {
			button.addEventListener('click', this.handleClick);
			button.addEventListener('keydown', this.handleKeydown);
			button.addEventListener('keyup', this.handleKeyup);
		});
	}

	removeEventListeners() {
		this.buttons.forEach(button => {
			button.removeEventListener('click', this.handleClick);
			button.removeEventListener('keydown', this.handleKeydown);
			button.removeEventListener('keyup', this.handleKeyup);
		});
	}

	initSections() {
		this.buttons.forEach(button => this.toggleSection(false, button));
	}

	destroySection() {
		this.buttons.forEach(button => this.toggleSection(null, button));
	}

	activateSection(button) {
		const isExpanded = button.getAttribute('aria-expanded') === 'true';

		// Close other
		if (!this.options.allowMultiple) { // do not close other sections if allowMultiple
			this.buttons.forEach(section => {
				if (section === button) {
					return;
				}
				this.toggleSection(false, section)
			});
		}

		// Toggle current
		if (this.options.allowToggle && isExpanded) { // if open and allowToggle we could close section
			this.toggleSection(false, button);
			return;
		}

		if (!isExpanded) {
			this.toggleSection(true, button);
		}
	}

	toggleSection(isOpen, button) {
		button.setAttribute('aria-expanded', isOpen);
		if ((this.options.allowToggle + this.options.allowMultiple) <= 0) { // if neither both or one is not enabled
			button.setAttribute('aria-disabled', isOpen);
		}

		const controlledSection = document.getElementById(button.getAttribute('aria-controls'));
		if (!controlledSection) {
			return;
		}
		controlledSection.setAttribute('aria-hidden', !isOpen);
		Accordion.animateHeight(isOpen, controlledSection);
	}

	handleClick(event) {
		event.preventDefault();
		this.activateSection(event.target);
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.SPACE:
			case keyCode.RETURN:
				this.handleClick(event);
				preventEventActions = true;
				break;
			case keyCode.DOWN:
				this.focusButtonByIndex(this.getButtonIndex(event.target) + 1);
				preventEventActions = true;
				break;
			case keyCode.UP:
				this.focusButtonByIndex(this.getButtonIndex(event.target) - 1);
				preventEventActions = true;
				break;
			case keyCode.HOME:
				this.focusButtonByIndex(0);
				preventEventActions = true;
				break;
			case keyCode.END:
				this.focusButtonByIndex(-1);
				preventEventActions = true;
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	handleKeyup(event) {
		const key = event.keyCode;
		if (key === keyCode.SPACE || key === keyCode.RETURN) {
			// Firefox synthetically fires click event on button element after keyup
			event.preventDefault();
		}
	}

	getButtonIndex(domNode) {
		const index = this.buttons.indexOf(domNode);
		return index === -1 ? 0 : index;
	}

	focusButtonByIndex(requestedIndex) {
		const buttonsLength = this.buttons.length;
		let nextIndex;

		if (requestedIndex < 0) {
			nextIndex = (buttonsLength - 1);
		} else {
			nextIndex = requestedIndex % buttonsLength;
		}

		this.buttons[nextIndex].focus();
	}

	static animateHeight(isOpen, domNode) {
		const innerElement = domNode.querySelector('[data-elem-acc-inner]');
		if (!innerElement) {
			return;
		}

		switch (isOpen) {
			case true:
				domNode.style.height = `${innerElement.offsetHeight}px`;
				break;
			case false:
				domNode.style.height = '0px';
				break;
			default:
				domNode.style.height = 'auto'; // remove hardcoded height in case of destroy
		}
	}

	static isAttributeSet(attr) {
		return attr === '' || attr === 'true';
	}
}
