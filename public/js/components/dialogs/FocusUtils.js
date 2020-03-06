export default class FocusUtils {
    constructor() {
        this.searchingFocusedElement = false;
    }

    static focusFirstDescendant(element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (FocusUtils.attemptFocus(child) || FocusUtils.focusFirstDescendant(child)) {
                return true;
            }
        }
        return false;
    }

    static focusLastDescendant(element) {
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
            const child = element.childNodes[i];
            if (FocusUtils.attemptFocus(child) || FocusUtils.focusLastDescendant(child)) {
                return true;
            }
        }
        return false;
    }

    static attemptFocus(element) {
        if (!FocusUtils.isFocusable(element)) {
            return false;
        }

        this.searchingFocusedElement = true;

        try {
            element.focus();
        } catch (e) {
            // catch error
        }

        this.searchingFocusedElement = false;

        return (document.activeElement === element);
    }

    static isFocusable(element) {
        if (element.tabIndex > 0 || (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)) {
            return true;
        }

        if (element.disabled) {
            return false;
        }

        switch (element.nodeName) {
            case 'A':
                return !!element.href && element.rel !== 'ignore';
            case 'INPUT':
                return element.type !== 'hidden' && element.type !== 'file';
            case 'BUTTON':
            case 'SELECT':
            case 'TEXTAREA':
                return true;
            default:
                return false;
        }
    }
};
