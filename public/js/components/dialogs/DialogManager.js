const Dialog = import('./Dialog');
const Modal = import('./Modal');

export default class DialogManager {
    /**
     * DialogManager
     *
     * Instantiated as single tone (window.dialogManager).
     * This dialog manger is responsible to open, manage dialog stack (bring down,
     * bring up, replace) and close dialogs. It also broadcast events about status
     * of the dialogs (close and open states).
     * @class
     */
    constructor() {
        this.keyCode = Object.freeze({
            ESC: 27
        });

        this.dialogsStack = [];
    }

    /**
     * openDialog
     *
     * If one dialog is opened it opens new one on top of previous.
     * After the top dialog is closed focus moves to previous dialog. So it creates
     * focus subset of main document. It is required to domNode that is focused after
     * dialog is closed. Broadcast native 'dialog:open' after open to handle callbacks.
     *
     * @public
     * @param {String} dialogType - type of dialog. Could be panel or modal. Currently used to much Bootstrap modals.
     * @param {String} dialogId - ID of dialog node in format of CSS selector. Eg: `#myDialog`. Currently used to much Bootstrap modals.
     * @param {HTMLElement} [focusAfterClose] - domNode of element that focused when dialog is closed and focus brings back to the page
     * @param {HTMLElement} [focusAfterOpen] - domNode of element that should be focused when dialog is opened. If no first focusable element will used.
     * @returns {Boolean} - is dialog replaced
     */
    openDialog(dialogType, dialogId, focusAfterClose, focusAfterOpen) {
        const dialogNode = document.querySelector(dialogId);
        if (this.isDialogInStack(dialogNode) || !dialogNode) {
            return;
        }

        if (this.dialogsStack.length > 0) { // If we open dialog over the last one
            this._bringCurrentDialogDown();
        } else { // If this is first opened dialog add close listeners
            this._addEventListeners();
        }

        const createDialog = this._createDialog(dialogType, dialogNode, focusAfterClose, focusAfterOpen);
        if (createDialog) {
            document.body.classList.add('has-dialog');

            const event = new CustomEvent('dialog:open', { bubbles: true, cancelable: true });
            dialogNode.dispatchEvent(event);
        }
    }

    /**
     * Close the last one dialog in the stack
     * It throws native 'dialog:closed' event on dialog node after close.
     *
     * @public
     * @returns {Boolean}
     */
    closeDialog() {
        const currentDialog = this._getCurrentDialog();
        if (!currentDialog) {
            return false;
        }

        const lastDialog = currentDialog;
        this._destroyCurrentDialog();

        const event = new CustomEvent('dialog:closed', { bubbles: true, cancelable: true });
        if (lastDialog.enclosedNode) {
            // bootstrap compatibility workaround. Should be removed after dialog structure normalization.
            lastDialog.enclosedNode.dispatchEvent(event);
        } else {
            lastDialog.dialogNode.dispatchEvent(event);
        }

        if (this.dialogsStack.length > 0) {
            this._bringCurrentDialogToTop(); // after destroy previous one is currentDialog
        } else { // if this the last opened dialog
            document.body.classList.remove('has-dialog');
            this._removeEventListeners();
        }

        return true;
    }

    /**
     * Close all dialogs in the stack
     * It calls closeDialog function for each dialog in stack.
     *
     * @public
     * @returns {Boolean}
     */
    closeAll() {
        const stackLength = this.dialogsStack.length;

        for (let i = 0; i < stackLength; i++) {
            this.closeDialog();
        }

        return true;
    }

    /**
     * This method is designed to close last dialog for not specific button,
     * like close modal button, backdrop click or ESC. For element that do not know
     * if particular dialog is try to *force user to make a choice* inside the dialog.
     *
     * @public
     * @returns {Boolean}
     */
    closeDialogFromOutside() {
        const currentDialog = this._getCurrentDialog();
        if (!currentDialog) {
            return false;
        }

        if (currentDialog.isForcedToChoice) {
            this._createAlert(currentDialog, currentDialog.forcedChoiceAlertMessage);
            return false;
        }

        return this.closeDialog();
    }

    /**
     * replaceDialog
     *
     * Same as open dialog, but replace current dialog with new one.
     *
     * @public
     * @param {String} dialogType - type of dialog. Could be panel or modal. Currently used to much Bootstrap modals.
     * @param {String} newDialogId - ID of dialog node in format of CSS selector. Eg: `#myDialog`. Currently used to much Bootstrap modals.
     * @param {HTMLElement} newFocusAfterClosed - domNode of element that focused when dialog is closed and focus brings back to the page
     * @param {HTMLElement} [newFocusFirst] - domNode of element that should be focused when dialog is opened. If no first focusable element will used.
     * @returns {Boolean} - is dialog replaced
     */
    replaceDialog(dialogType, newDialogId, newFocusAfterClosed, newFocusFirst) {
        if (this.isDialogInStack(document.querySelector(newDialogId))) {
            return;
        }

        const topDialog = this._getCurrentDialog();
        const focusAfterClosed = newFocusAfterClosed || topDialog.focusAfterClose;

        this._destroyCurrentDialog();
        return this.openDialog(dialogType, newDialogId, focusAfterClosed, newFocusFirst);
    }

    /**
     * isDialogOpen
     *
     * Check if dialogNode showed on page as Dialog
     * @public
     * @param {HTMLElement} domNode - domNode of dialog
     * @returns {Boolean}
     */
    isDialogInStack(domNode) {
        return this.dialogsStack.some(dialog =>
            dialog.dialogNode === domNode || dialog.enclosedNode === domNode
            // enclosedNode used for bootstrap modals compatibility. Should be removed in future.
        );
    }

    _addEventListeners() {
        this.handleEscape = this._handleEscape.bind(this);
        this.handleClose = this._handleCloseButton.bind(this);

        document.addEventListener('keyup', this.handleEscape);
        document.addEventListener('click', this.handleClose);
    }

    _removeEventListeners() {
        document.removeEventListener('keyup', this.handleEscape);
        document.removeEventListener('click', this.handleClose);
    }

    _handleEscape(event) {
        if (event.keyCode === this.keyCode.ESC && this.closeDialogFromOutside()) {
            event.stopPropagation();
        }
    }

    _handleCloseButton(event) {
        const isCloseButton = event.target.getAttribute('data-dismiss') !== null || event.target.parentNode.getAttribute('data-dismiss') !== null;
        if (isCloseButton && this.closeDialogFromOutside()) {
            event.stopPropagation();
        }
    }

    _createDialog(dialogType, dialogNode, focusAfterClose, focusAfterOpen) {
        let dialog;
        let isDialogOpen;
        const focusAfterCloseElement = focusAfterClose || document.activeElement;

        if (dialogType === 'modal') {
            dialog = new Modal(this, dialogNode, focusAfterCloseElement, focusAfterOpen);
            isDialogOpen = dialog.create();
        } else {
            dialog = new Dialog(this, dialogNode, focusAfterCloseElement, focusAfterOpen);
            isDialogOpen = dialog.create();
        }

        this.dialogsStack.push(dialog);

        return isDialogOpen;
    }

    _getCurrentDialog() {
        if (this.dialogsStack.length) {
            return this.dialogsStack[this.dialogsStack.length - 1];
        }
    }

    _destroyCurrentDialog() {
        if (this._getCurrentDialog().destroy()) {
            this.dialogsStack.pop();
            return true;
        }
        return false;
    }

    _bringCurrentDialogToTop() {
        this._getCurrentDialog().bringOnTop();
    }

    _bringCurrentDialogDown() {
        this._getCurrentDialog().bringDown();
    }

    _createAlert(dialog, message) {
        if (!message || message === 'false') {
            return;
        }

        if (!this.alert) {
            this.alert = document.createElement('div');
            this.alert.className = 'b-dialog_alert';
            this.alert.setAttribute('role', 'alert');
        }

        this.alert.textContent = message;
        dialog.dialogNode.appendChild(this.alert);

        clearTimeout(this.alertTimout);
        this.alertTimout = setTimeout(() => {
            if (this.alert) {
                dialog.dialogNode.removeChild(this.alert);
            }
            this.alert = null;
        }, 2000);
    }

    static validateDialogStructure(dialogNode) {
        const validRoles = ['dialog', 'alertdialog'];
        const isDialog = (dialogNode.getAttribute('role') || '')
            .trim()
            .split(/\s+/g)
            .some(token => validRoles.some(role => token === role));
        if (!isDialog) {
            throw new Error('Dialog() requires a DOM element with ARIA role of "dialog" or "alertdialog".');
        }
    }
};
