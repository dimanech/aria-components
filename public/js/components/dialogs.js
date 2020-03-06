const DialogManager = import('./DialogManager');

module.exports = function() {
    window.dialogManager = new DialogManager();

    document.addEventListener('click', event => {
        const button = event.target;
        const toggle = button.getAttribute('data-toggle');
        if (!toggle || toggle !== 'modal') {
            return;
        }
        event.preventDefault();

        const controlledModalId = button.getAttribute('data-target');
        const focusAfterOpen = button.getAttribute('data-focus-in-modal');
        if (controlledModalId === null) {
            return;
        }

        window.dialogManager.openDialog('modal', controlledModalId, button, focusAfterOpen);
    });
};
