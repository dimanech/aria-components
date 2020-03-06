export default class InputClear {
    constructor(button) {
        this.button = button;
        this.input = document.getElementById(button.getAttribute('data-clear-input'));
    }

    init() {
        if (!this.input) {
            return;
        }

        this.addEventListeners();
    }

    addEventListeners() {
        this.clearInput = this.clearInput.bind(this);
        this.toggleClearButton = this.toggleClearButton.bind(this);

        this.input.addEventListener('input', this.toggleClearButton);
        this.button.addEventListener('click', this.clearInput);
    }

    toggleClearButton() {
        if (this.input.value.length > 0) {
            this.showButton();
        } else {
            this.hideButton();
        }
    }

    showButton() {
        this.button.classList.add('m-visible');
    }

    hideButton() {
        this.button.classList.remove('m-visible');
    }

    clearInput() {
        this.input.value = '';
        this.button.classList.remove('m-visible');
    }

    destroy() {
        this.input.removeEventListener('input', this.showClearButton);
        this.button.removeEventListener('click', this.clearInput);
    }
};
