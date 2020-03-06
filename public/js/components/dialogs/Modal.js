const Dialog = import('./Dialog');

export default class Modal extends Dialog {
    // This extend only for mimic Bootstrap Modals.
    // The only difference from Dialog is structure. The dialog required backdrop
    // without any roles same as browser vendors and W3C use,
    // Bootstrap use backdrop as modal declaration.
    // So we move `dialogNode` to inner div.
    constructor(dialogManager, dialogNode, focusAfterClose, focusAfterOpen) {
        super(dialogManager, dialogNode, focusAfterClose, focusAfterOpen);

        this.enclosedNode = dialogNode;
        this.dialogNode = this.enclosedNode.querySelector('.modal-dialog');
    }

    afterOpen() {
        this.enclosedNode.setAttribute('aria-hidden', 'false');
    }

    beforeClose() {
        this.enclosedNode.setAttribute('aria-hidden', 'true');
    }

    initBackdrop() {
        const backdropClass = 'modal';

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
};
