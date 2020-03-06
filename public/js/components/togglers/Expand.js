const keyCode = Object.freeze({
    RETURN: 13,
    SPACE: 32
});

export default class Expand {
    /**
     * Expand (Disclosure / Summary)
     * This is expand button implementation that could be used for several different
     * cases like disclosure / summary component (show-hide), panel control button etc.
     * Please see W3C specs https://www.w3.org/TR/wai-aria-practices/#disclosure
     *
     * @param {HTMLElement} button - toggle button with `aria-controls`
     * @example
     * <button aria-expanded="false" aria-controls="more-details">Read more...</button>
     * <div id="more-details">Lorem ipsum...</div>
     */
    constructor(button) {
        this.button = button;
        this.isOpen = false;
        this.keyCode = keyCode;
    }

    init() {
        this.controledElement = document.getElementById(this.button.getAttribute('aria-controls'));
        if (!this.controledElement) {
            return;
        }
        this.addComponentReference();
        this.addEventListeners();
        this.initState();
    }

    destroy() {
        this.removeEventListeners();
        this.removeComponentReference();
        this.destroyState();
    }

    addEventListeners() {
        this.handleClick = this.handleClick.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleKeyup = this.handleKeyup.bind(this);

        this.button.addEventListener('click', this.handleClick);
        this.button.addEventListener('keydown', this.handleKeydown);
        this.button.addEventListener('keyup', this.handleKeyup);
    }

    removeEventListeners() {
        this.button.removeEventListener('click', this.handleClick);
        this.button.removeEventListener('keydown', this.handleKeydown);
        this.button.removeEventListener('keyup', this.handleKeyup);
    }

    addComponentReference() {
        this.button.widget = this;
    }

    removeComponentReference() {
        delete this.button.widget;
    }

    initState() {
        this.isOpen = !(this.button.getAttribute('aria-expanded') === 'true');
        this.toggle();
    }

    destroyState() {
        this.button.removeAttribute('aria-expanded');
        this.controledElement.removeAttribute('aria-hidden');
    }

    handleClick(event) {
        event.preventDefault();
        this.toggle();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    close() {
        this.button.setAttribute('aria-expanded', 'false');
        this.controledElement.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        this.button.dispatchEvent(new CustomEvent('toggle:close', { bubbles: true, cancelable: true }));
    }

    open() {
        this.button.setAttribute('aria-expanded', 'true');
        this.controledElement.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        this.button.dispatchEvent(new CustomEvent('toggle:open', { bubbles: true, cancelable: true }));
    }

    handleKeydown(event) {
        const key = event.which || event.keyCode;
        let preventEventActions = false;

        switch (key) {
            case this.keyCode.SPACE:
                this.handleClick(event);
                preventEventActions = true;
                break;
            case this.keyCode.RETURN:
                this.handleClick(event);
                preventEventActions = true;
                break;
        }

        if (preventEventActions) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    handleKeyup(event) {
        const key = event.which || event.keyCode;
        // FF fires click event on button node after keyup
        if (key === this.keyCode.SPACE || key === this.keyCode.RETURN) {
            event.preventDefault();
        }
    }
};
