export default class DependantInput {
    /**
     * DependantInput
     *
     * Set enabled|disabled state for element depends of state of several inputs in forms.
     * Accept dependant elements array of IDs in JSON format. Ex:
     * `data-js-input-depends-from='["older-than-18", "conditionsandprivacy"]'`
     *
     * Root array represent all dependant elements - could be single ID or group. When all elements or
     * groups will be resolved input gets enabled state. Ex:
     * `data-js-input-depends-from='["a", "b", "c"]'`
     * Resolved when a and b and c is checked
     *
     * Sub array represents separate groups and if **one of group** elements are valid|checked
     * that **group threat as resolved**. Ex:
     * `data-js-input-depends-from='[["a", "b"]]'`
     * Resolved when a and/or b is checked (One in the group).
     * `data-js-input-depends-from='[["a", "b", "c"], "d", ["f", "g", "h"]]'`
     * Resolved when one/more of [a|b|c] are checked, d is checked, and one/more of [f|g|h] is checked.
     *
     * @param {HTMLInputElement} domNode - input input=text|button that dependant on set of other input states
     */
    constructor(domNode) {
        this.input = domNode;
        this.form = DependantInput.findParentForm(domNode);
        this.parentDiv = this.input.parentNode;
        this.dependsFrom = [];

        this.handleChange = this.handleChange.bind(this);

        if (this.prepareDependants(this.input)) {
            this.addEventListeners();
        } else {
            console.error('DependantInput component has wrong JSON configuration. Component not inited!'); // eslint-disable-line
        }
    }

    init() {
        this.handleChange();
    }

    addEventListeners() {
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
                    hasValidInGroup = DependantInput.isDependencyResolved(item);
                });
                dependantsState.push(hasValidInGroup);
            } else {
                dependantsState.push(DependantInput.isDependencyResolved(item));
            }
        });

        if (dependantsState.indexOf(false) > -1) {
            this.disableInput();
        } else {
            this.enableInput();
        }
    }

    enableInput() {
        this.input.removeAttribute('disabled');
        this.parentDiv.classList.remove('m-area-disabled');
        this.parentDiv.classList.add('m-area-enabled');
    }

    disableInput() {
        this.input.setAttribute('disabled', '');
        this.input.classList.remove('is-invalid');
        this.parentDiv.querySelector('.invalid-feedback').innerHTML = '';
        this.parentDiv.classList.remove('m-area-enabled');
        this.parentDiv.classList.add('m-area-disabled');
    }

    static isDependencyResolved(id) {
        const domNode = document.getElementById(id);
        const nodeType = domNode.getAttribute('type').toUpperCase();
        const hasCheckedState = nodeType === 'CHECKBOX' || nodeType === 'RADIO';
        return hasCheckedState ? (domNode.validity.valid && domNode.checked) : domNode.validity.valid;
    }

    static findParentForm(domNode) {
        const parent = domNode.parentNode;
        return parent.tagName === 'FORM' ? parent : DependantInput.findParentForm(parent);
    }

    prepareDependants(domNode) {
        try {
            this.dependsFrom = JSON.parse(domNode.getAttribute('data-js-input-depends-from'));
        } catch (e) {
            return false;
        }
        return true;
    }
};
