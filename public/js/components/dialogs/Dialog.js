const FocusUtils = import('./FocusUtils');

export default class Dialog {
    /*
    * Dialog / Alert dialog
    * This content is licensed according to the W3C Software License at
    * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
    * Please see full specifications at:
    * https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html
    * https://www.w3.org/TR/wai-aria-practices/#alertdialog
    */
    constructor(dialogManager, dialogNode, focusAfterClose, focusAfterOpen) {
        this.dialogManager = dialogManager;
        this.dialogNode = dialogNode;
        this.focusAfterClose = Dialog.setFocusAfterCloseElement(focusAfterClose);
        this.focusAfterOpen = Dialog.setFocusAfterOpenElement(focusAfterOpen);
        this.isForcedToChoice = this.dialogNode.getAttribute('data-isForcedToChoice') || false; // allow close only by choice
        this.forcedChoiceAlertMessage = this.dialogNode.getAttribute('data-forcedChoiceAlertMessage') || 'Please make a choice in modal window';
        this.backdropNode = null;

        // Additional methods
        this.focusFirstDescendant = FocusUtils.focusFirstDescendant;
        this.focusLastDescendant = FocusUtils.focusLastDescendant;
        this.searchingFocusedElement = FocusUtils.searchingFocusedElement;

        this.handleFocus = this.handleFocus.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
    }

    create() {
        this.initBackdrop();
        this.createFocusTrap();
        this.initEventListeners();

        this.dialogNode.classList.add('is-open');
        this.dialogNode.setAttribute('aria-hidden', 'false');

        // handle animation/transition delay that could temporary modify a11y tree
        // focus could not trap into modal if user tab before this timeout
        // please see tab handler
        const handleTransitionEnd = (event) => {
            if (event && event.target !== this.dialogNode) {
                return;
            }
            clearTimeout(this.transitionEndFallbackTimeout);
            this.dialogNode.removeEventListener('transitionend', handleTransitionEnd);
            this.focusElementAfterOpen();
        };
        this.dialogNode.addEventListener('transitionend', handleTransitionEnd);
        this.transitionEndFallbackTimeout = setTimeout(handleTransitionEnd, 500);

        this.afterOpen();

        return true;
    }

    destroy() {
        this.beforeClose();

        this.removeEventListeners();
        this.removeFocusTrap();
        this.removeBackdrop();

        this.dialogNode.classList.remove('is-open');
        this.dialogNode.setAttribute('aria-hidden', 'true');

        this.focusElementAfterClose();

        return true;
    }

    bringDown() {
        this.removeEventListeners();
        this.backdropNode.classList.remove('is-top-dialog');
    }

    bringOnTop() {
        this.initEventListeners();
        this.backdropNode.classList.add('is-top-dialog');
    }

    focusElementAfterOpen() {
        return this.focusAfterOpen ? this.focusAfterOpen.focus() : this.focusFirstDescendant(this.dialogNode);
    }

    focusElementAfterClose() {
        this.focusAfterClose.focus();
    }

    initEventListeners() {
        document.addEventListener('focus', this.handleFocus, true);
    }

    removeEventListeners() {
        document.removeEventListener('focus', this.handleFocus, true);
    }

    handleFocus(event) {
        if (this.searchingFocusedElement) {
            return;
        }

        switch (true) {
            case (event.target === this.boundFocusNodeStart):
                this.focusLastDescendant(this.dialogNode);
                break;
            case (event.target === this.boundFocusNodeEnd):
                this.focusFirstDescendant(this.dialogNode);
                break;
            case (!this.dialogNode.contains(event.target)):
                this.focusFirstDescendant(this.dialogNode); // in case when window is animated and user tab
                break;
            default:
        }
    }

    createFocusTrap() {
        // Enclose the dialog node with two invisible, focusable nodes.
        // While this dialog is open, we use these to make sure that focus never
        // leaves the document even if dialogNode is the first or last node.
        // This start to work only when some element inside dialog is focused so
        // please see focusElementAfterOpen

        const firstFocusable = document.createElement('div');
        firstFocusable.tabIndex = 0;
        this.backdropNode.insertBefore(firstFocusable, this.dialogNode);
        this.boundFocusNodeStart = firstFocusable;

        const lastFocusable = document.createElement('div');
        lastFocusable.tabIndex = 0;
        this.backdropNode.insertBefore(lastFocusable, this.dialogNode.nextSibling);
        this.boundFocusNodeEnd = lastFocusable;
    }

    removeFocusTrap() {
        this.backdropNode.removeChild(this.boundFocusNodeStart);
        this.backdropNode.removeChild(this.boundFocusNodeEnd);
    }

    initBackdrop() {
        const backdropClass = 'js-dialog-backdrop';

        let parent = this.dialogNode.parentNode;
        if (parent.classList.contains(backdropClass)) {
            this.backdropNode = parent;
        } else {
            this.encloseModalWithBackdrop(backdropClass);
        }

        this.backdropNode.addEventListener('click', this.handleBackdropClick);
        this.backdropNode.classList.add('is-active');
        this.backdropNode.classList.add('is-top-dialog');
    }

    removeBackdrop() {
        this.backdropNode.removeEventListener('click', this.handleBackdropClick);
        this.backdropNode.classList.remove('is-active');
        this.backdropNode.classList.remove('is-top-dialog');
    }

    encloseModalWithBackdrop(backdropClass) {
        this.backdropNode = document.createElement('div');
        this.backdropNode.className = backdropClass;
        this.dialogNode.parentNode.insertBefore(this.backdropNode, this.dialogNode);
        this.backdropNode.appendChild(this.dialogNode);
    }

    handleBackdropClick(event) {
        if (event.target !== this.backdropNode) {
            return;
        }

        this.dialogManager.closeDialogFromOutside();
    }

    afterOpen() {}

    beforeClose() {}

    static setFocusAfterOpenElement(focusFirst) {
        let focusElement;
        if (typeof focusFirst === 'string') {
            focusElement = document.getElementById(focusFirst);
        } else if (typeof focusFirst === 'object') {
            focusElement = focusFirst;
        } else {
            focusElement = null;
        }

        return focusElement;
    }

    static setFocusAfterCloseElement(focusAfterClosed = document.activeElement) {
        let focusElement;
        if (typeof focusAfterClosed === 'string') {
            focusElement = document.getElementById(focusAfterClosed);
        } else if (typeof focusAfterClosed === 'object') {
            focusElement = focusAfterClosed;
        } else {
            throw new Error('the focusAfterClosed parameter is required for the aria.Dialog constructor.');
        }

        return focusElement;
    }
};
