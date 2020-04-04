// todo: implement step funct-ty 2,3,4 etc

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
     *      />
     *      <button tabindex="-1">+</button>
     *  </div>
     */
    constructor(domNode) {
        this.input = domNode;
        this.incrementButton = this.input.nextElementSibling;
        this.decrementButton = this.input.previousElementSibling;
    }

    initOptions() {
        this.minValue = this.getMinValue();
        this.maxValue = this.getMaxValue();
        this.middleValue = this.getMiddleValue();
        this.currentValue = parseInt(this.input.value, 10);
        this.isBusy = false;
    }

    init() {
        this.initOptions();
        this.addEventListeners();
        this.setInputValue(this.currentValue);
        this.updateState();
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

    destroy() {
        window.clearTimeout(this.eventTimeout);
        this.removeEventListeners();
    }

    addEventListeners() {
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleIncrement = this.increment.bind(this);
        this.handleDecrement = this.decrement.bind(this);

        this.input.addEventListener('keydown', this.handleKeydown);
        this.input.addEventListener('input', this.handleInput);

        this.incrementButton.addEventListener('click', this.handleIncrement);
        this.decrementButton.addEventListener('click', this.handleDecrement);
    }

    removeEventListeners() {
        this.input.removeEventListener('keydown', this.handleKeydown);
        this.input.removeEventListener('input', this.handleInput);

        this.incrementButton.removeEventListener('click', this.handleIncrement);
        this.decrementButton.removeEventListener('click', this.handleDecrement);
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

    increment() {
        const value = parseInt(this.input.value, 10);
        this.setInputValue(this.filterInput(value + 1));
    }

    decrement() {
        const value = parseInt(this.input.value, 10);
        this.setInputValue(this.filterInput(value - 1));
    }

    filterInput(value) {
        if (value === '' || value === '-') {
            return this.middleValue;
        }

        const parsedInput = parseInt(value, 10);
        if (typeof parsedInput !== 'number' || Number.isNaN(parsedInput)) {
            return;
        }

        let result = parsedInput;

        if (parsedInput < this.minValue) {
            result = this.minValue;
        } else if (parsedInput > this.maxValue) {
            result = this.maxValue;
        }

        if (!isFinite(this.minValue)) {
            result = parsedInput;
        } else if (!isFinite(this.maxValue)) {
            result = parsedInput;
        }

        return result;
    }

    setInputValue(value) {
        if (this.isBusy || isNaN(value)) {
            return;
        }
        // We should always set values since it work like filter and override any incorrect input
        this.input.value = value;
        this.input.setAttribute('aria-valuenow', value);
        this.input.setAttribute('value', value);

        if (this.currentValue !== value) {
            this.currentValue = value;
            this.updateState();
            this.dispatchChange();
        }
    }

    dispatchChange() {
        window.clearTimeout(this.eventTimeout);
        const updateEvent = new CustomEvent('spinbutton:change', { bubbles: true, cancelable: true });
        this.eventTimeout = window.setTimeout(() => this.input.dispatchEvent(updateEvent), 1000);
    }

    dispatchWarn() {
        const detail = {
            currentValue: this.currentValue,
            minValue: this.minValue,
            maxValue: this.maxValue
        };
        const warnEvent = new CustomEvent('spinbutton:warn', { bubbles: true, cancelable: true, detail: detail });
        this.input.dispatchEvent(warnEvent);
    }

    updateState() {
        if (this.input.getAttribute('disabled') !== null) {
            this.incrementButton.setAttribute('disabled', '');
            this.decrementButton.setAttribute('disabled', '');

            return;
        }

        this.toggleButtonsState(this.decrementButton, (this.currentValue <= this.minValue && isFinite(this.minValue)));
        this.toggleButtonsState(this.incrementButton, (this.currentValue >= this.maxValue && isFinite(this.maxValue)));
    }

    toggleButtonsState(button, isDisabled) {
        if (isDisabled) {
            button.setAttribute('disabled', '');
            this.dispatchWarn();
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
