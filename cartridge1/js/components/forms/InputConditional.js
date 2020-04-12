export default class InputConditional {
    /**
     * InputConditional
     *
     * Set enabled|disabled state for element depends of state of several inputs in forms.
     * Accept dependant elements array of IDs in JSON format. Ex:
     * `data-input-depends-from='["older-than-18", "conditionsandprivacy"]'`
     *
     * Root array represent all dependant elements - could be single ID or group. When all elements or
     * groups will be resolved input gets enabled state. Ex:
     * `data-input-depends-from='["a", "b", "c"]'`
     * Resolved when a and b and c is checked
     *
     * Sub array represents separate groups and if **one of group** elements are valid|checked
     * that **group threat as resolved**. Ex:
     * `data-input-depends-from='[["a", "b"]]'`
     * Resolved when a and/or b is checked (One in the group).
     * `data-input-depends-from='[["a", "b", "c"], "d", ["f", "g", "h"]]'`
     * Resolved when one/more of [a|b|c] are checked, d is checked, and one/more of [f|g|h] is checked.
     *
     * @param {HTMLInputElement} domNode - input input=text|button that dependant on set of other input states
     */
    constructor(domNode) {
        this.input = domNode;
        this.form = InputConditional.findParentForm(domNode);
        this.dependsFrom = [];
    }

    init() {
        if (!this.prepareDependants(this.input)) {
            console.error('InputConditional component has wrong JSON configuration. Component not inited!'); // eslint-disable-line
            return;
        }

        this.addEventListeners();
        this.handleChange();
    }

    addEventListeners() {
        this.handleChange = this.handleChange.bind(this);
        this.form.addEventListener('change', this.handleChange);
    }

    handleChange() {
        let dependantsState = [];

        this.dependsFrom.forEach(item => {
            if (typeof item === 'object') {
                let hasValidInGroup = false;
                item.forEach(item => {
                    if (hasValidInGroup) {
                        return;
                    }
                    hasValidInGroup = InputConditional.isDependencyResolved(item);
                });
                dependantsState.push(hasValidInGroup);
            } else {
                dependantsState.push(InputConditional.isDependencyResolved(item));
            }
        });

        this.toggleInput(dependantsState.indexOf(false) > -1);
    }

    toggleInput(isDisabled) {
        this.input.toggleAttribute('disabled', isDisabled);
        if (isDisabled) {
            this.input.removeAttribute('required');
        } else {
            this.input.setAttribute('required', '');
        }
        this.input.dispatchEvent(new Event('input:checkValidity', { bubbles: true }));
    }

    static isDependencyResolved(id) {
        const domNode = document.getElementById(id);
        const nodeType = domNode.getAttribute('type').toUpperCase();
        const hasCheckedState = nodeType === 'CHECKBOX' || nodeType === 'RADIO';
        return hasCheckedState ? (domNode.checked && domNode.validity.valid) : domNode.validity.valid;
    }

    static findParentForm(domNode) {
        const parent = domNode.parentNode;
        return parent.tagName === 'FORM' ? parent : InputConditional.findParentForm(parent);
    }

    prepareDependants(domNode) {
        try {
            this.dependsFrom = JSON.parse(domNode.getAttribute('data-input-depends-from'));
            return true;
        } catch (e) {
            return false;
        }
    }
};
