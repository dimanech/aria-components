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
     * Please see W3C specs https://www.w3.org/TR/wai-aria-practices/#accordion
     *
     * Configuration:
     * `data-allow-toggle` - Allow for each toggle to both open and close its section.
     *  Makes it possible for all sections to be closed.
     * `data-allow-multiple` - Allow for multiple accordion sections to be expanded
     *  at the same time.
     */
    constructor(groupNode) {
        this.group = groupNode;
        this.buttons = Array.from(this.group.querySelectorAll('[data-aria-controls]:not([data-role=tab])'));
        this.allowToggle = this.isAttributeSet(this.group.getAttribute('data-allow-toggle'));
        this.allowMultiple = this.isAttributeSet(this.group.getAttribute('data-allow-multiple'));
        this.keyCode = keyCode;
    }

    init() {
        this.initRoles();
        this.addEventListeners();
    }

    destroy() {
        this.destroyRoles();
        this.removeEventListeners();
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

    reinit() {}

    handleClick(event) {
        event.preventDefault();
        this.toggleSection(event.target);
    }

    toggleSection(button) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (!this.allowMultiple) {
            this.buttons.forEach(button => Accordion.closeSection(button));
        }

        if ((this.allowToggle || this.allowMultiple) && isExpanded) {
            Accordion.closeSection(button);
        } else {
            Accordion.openSection(button);
        }
    }

    static closeSection(button) {
        button.setAttribute('aria-expanded', 'false');
        button.classList.remove('m-expanded');

        const controlledSection = document.getElementById(button.getAttribute('data-aria-controls'));
        if (!controlledSection) {
            return;
        }
        controlledSection.setAttribute('aria-hidden', 'true');
        controlledSection.classList.remove('m-expanded');
    }

    static openSection(button) {
        button.setAttribute('aria-expanded', 'true');
        button.classList.add('m-expanded');

        const controlledSection = document.getElementById(button.getAttribute('data-aria-controls'));
        if (!controlledSection) {
            return;
        }
        controlledSection.setAttribute('aria-hidden', 'false');
        controlledSection.classList.add('m-expanded');
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
            case this.keyCode.DOWN:
                this.focusButtonByIndex(this.getButtonIndex(event.target) + 1);
                preventEventActions = true;
                break;
            case this.keyCode.UP:
                this.focusButtonByIndex(this.getButtonIndex(event.target) - 1);
                preventEventActions = true;
                break;
            case this.keyCode.HOME:
                this.focusButtonByIndex(0);
                preventEventActions = true;
                break;
            case this.keyCode.END:
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
        const key = event.which || event.keyCode;
        // FF fires click event on button node after keyup
        if (key === this.keyCode.SPACE || key === this.keyCode.RETURN) {
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

    initRoles() {
        this.buttons.forEach(button => {
            button.setAttribute('role', 'button');
            button.tabIndex = 0;
            button.setAttribute('aria-controls', button.getAttribute('data-aria-controls'));
            button.setAttribute('aria-expanded', 'false');
            document.getElementById(button.getAttribute('data-aria-controls')).setAttribute('role', 'region');
        });
    }

    destroyRoles() {
        this.buttons.forEach(button => {
            button.removeAttribute('role');
            button.tabIndex = -1;
            button.removeAttribute('aria-controls');
            button.removeAttribute('aria-expanded');
            const controlledSection = document.getElementById(button.getAttribute('data-aria-controls'));
            controlledSection.removeAttribute('role');
            controlledSection.removeAttribute('aria-hidden');
            controlledSection.classList.remove('m-expanded');
        });
    }

    isAttributeSet(attr) {
        return attr === '' || attr === 'true';
    }
};
