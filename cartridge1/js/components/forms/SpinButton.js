// TODO: implement stepMismatch, badInput, rangeOverflow, rangeUnderflow validation messages

const keyCode = Object.freeze({
	PAGEUP: 33,
	PAGEDOWN: 34,
	END: 35,
	HOME: 36,
	UP: 38,
	DOWN: 40
});

export default class SpinButton {
	/**
     * SpinButton
     * See full specs https://www.w3.org/TR/wai-aria-practices/#spinbutton
     * @example:
     *  <div class="spinbutton">
     *      <button tabindex="-1">-</button>
     *      <input
     *          type="text"
     *          role="spinbutton"
     *          value="0"
     *          aria-valuenow="0"
     *          aria-valuemin="0"
     *          aria-valuemax="50"
     *          data-step="2"
     *      />
     *      <button tabindex="-1">+</button>
     *  </div>
     */
	constructor(domNode) {
		this.input = domNode;
		this.buttonIncrement = this.input.nextElementSibling;
		this.buttonDecrement = this.input.previousElementSibling;
	}

	initOptions() {
		this.minValue = this.getMinValue();
		this.maxValue = this.getMaxValue();
		this.middleValue = this.getMiddleValue();
		this.currentValue = parseInt(this.input.value, 10);
		this.incrementStep = parseInt(this.input.getAttribute('data-step'), 10) || 1;
		this.isBusy = false;
	}

	init() {
		this.initOptions();
		this.addEventListeners();
		this.setInputValue(this.currentValue);
		this.updateState();
		this.checkValidity();
	}

	update() {
		this.initOptions();
		this.updateState();
	}

	set valuenow(value) {
		this.setInputValue(parseInt(value, 10));
	}

	// freeze component in case of async calls
	toggleBusy(isBusy) {
		this.isBusy = isBusy;
		if (isBusy) {
			this.input.setAttribute('readonly', 'true');
		} else {
			this.input.removeAttribute('readonly');
		}
		this.input.setAttribute('aria-busy', isBusy);
	}

	addEventListeners() {
		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleIncrement = this.increment.bind(this);
		this.handleDecrement = this.decrement.bind(this);

		this.input.addEventListener('keydown', this.handleKeydown);
		this.input.addEventListener('input', this.handleInput);
		this.input.addEventListener('change', this.handleChange);

		this.buttonIncrement.addEventListener('click', this.handleIncrement);
		this.buttonDecrement.addEventListener('click', this.handleDecrement);
	}

	removeEventListeners() {
		this.input.removeEventListener('keydown', this.handleKeydown);
		this.input.removeEventListener('input', this.handleInput);
		this.input.removeEventListener('change', this.handleChange);

		this.buttonIncrement.removeEventListener('click', this.handleIncrement);
		this.buttonDecrement.removeEventListener('click', this.handleDecrement);
	}

	destroy() {
		window.clearTimeout(this.changeDispatchTimeout);
		this.removeEventListeners();
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.UP:
				this.increment();
				preventEventActions = true;
				break;
			case keyCode.DOWN:
				this.decrement();
				preventEventActions = true;
				break;
			case keyCode.PAGEUP:
				this.setInputValue(this.filterInput(this.currentValue += 10));
				preventEventActions = true;
				break;
			case keyCode.PAGEDOWN:
				this.setInputValue(this.filterInput(this.currentValue -= 10));
				preventEventActions = true;
				break;
			case keyCode.HOME:
				this.setInputValue(this.minValue);
				preventEventActions = true;
				break;
			case keyCode.END:
				this.setInputValue(this.maxValue);
				preventEventActions = true;
				break;
			default:
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	handleInput() {
		this.setInputValue(this.filterInput(this.input.value));
	}

	handleChange() {
		this.input.dispatchEvent(new Event('input:checkValidity', { bubbles: true }));
	}

	increment() {
		const value = parseInt(this.input.value, 10);
		this.setInputValue(this.filterInput(value + this.incrementStep));
	}

	decrement() {
		const value = parseInt(this.input.value, 10);
		this.setInputValue(this.filterInput(value - this.incrementStep));
	}

	filterInput(value) {
		if (value === '' || value === '-') {
			return this.middleValue;
		}

		const input = parseInt(value, 10);
		if (typeof input !== 'number' || Number.isNaN(input)) {
			return;
		}

		let result = input;

		if (input < this.minValue) {
			this.dispatchState('attemptUnderflow');
			result = this.minValue;
		} else if (input > this.maxValue) {
			this.dispatchState('attemptOverflow');
			result = this.maxValue;
		}

		if (!isFinite(this.minValue)) {
			result = input;
		} else if (!isFinite(this.maxValue)) {
			result = input;
		}

		return result;
	}

	setInputValue(value) {
		if (this.isBusy || isNaN(value)) {
			return;
		}
		// We should always set values since it work like filter and override any incorrect input
		this.input.value = value;
		this.input.setAttribute('value', value);
		this.input.setAttribute('aria-valuenow', value);

		if (this.currentValue === value) {
			return;
		}
		this.currentValue = value;
		this.updateState();
		this.checkValidity();
		this.handleChange();
		this.dispatchChange();
	}

	checkValidity() {
		const value = this.currentValue;
		if (value < this.minValue || value > this.maxValue) {
			this.dispatchState('invalid');
			this.input.setCustomValidity(this.input.getAttribute('data-range-error'));
		} else {
			this.input.setCustomValidity('');
		}
	}

	dispatchChange() {
		window.clearTimeout(this.changeDispatchTimeout);
		const updateEvent = new Event('spinbutton:change', { bubbles: true, cancelable: true });
		this.changeDispatchTimeout = window.setTimeout(() => this.input.dispatchEvent(updateEvent), 1000);
	}

	dispatchState(type) {
		const detail = {
			currentValue: this.currentValue,
			minValue: this.minValue,
			maxValue: this.maxValue
		};
		this.input.dispatchEvent(
			new CustomEvent('spinbutton:' + type, { bubbles: true, cancelable: true, detail: detail }));
	}

	updateState() {
		if (this.input.getAttribute('disabled') !== null) {
			this.buttonIncrement.setAttribute('disabled', '');
			this.buttonDecrement.setAttribute('disabled', '');

			return;
		}

		this.toggleButtonsState(this.buttonDecrement, (this.currentValue <= this.minValue && isFinite(this.minValue)));
		this.toggleButtonsState(this.buttonIncrement, (this.currentValue >= this.maxValue && isFinite(this.maxValue)));
	}

	toggleButtonsState(button, isDisabled) {
		if (isDisabled) {
			button.setAttribute('disabled', '');
		} else {
			button.removeAttribute('disabled');
		}
	}

	getMinValue() {
		const min = this.input.getAttribute('aria-valuemin');
		const minParsed = parseInt(min, 10);

		return (min && !isNaN(minParsed)) ? minParsed : Infinity;
	}

	getMaxValue() {
		const max = this.input.getAttribute('aria-valuemax');
		const maxParsed = parseInt(max, 10);

		return (max && !isNaN(maxParsed)) ? maxParsed : Infinity;
	}

	getMiddleValue() {
		switch (true) {
			case !isFinite(this.minValue):
			case !isFinite(this.maxValue):
				return 0;
			case (this.minValue >= 0 && this.maxValue >= 0):
				return this.minValue;
			case (this.minValue <= 0 && this.maxValue <= 0):
				return this.maxValue;
			default:
				return 0;
		}
	}
}
