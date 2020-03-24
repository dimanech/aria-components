export default class DialogButton {
	constructor(domNode, pageComponents) {
		this.button = domNode;
		this.dialogManager = pageComponents.DialogManager;
		this.type = this.button.getAttribute('data-dialog-type');
		this.controlledDialogId = this.button.getAttribute('aria-controls');
		this.focusAfterOpen = this.button.getAttribute('data-focus-in-modal');
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		if (this.controlledDialogId === null) {
			return;
		}

		this.openDialog = this.openDialog.bind(this);
		this.button.addEventListener('click', this.openDialog);
	}

	openDialog(event) {
		event.preventDefault();

		const config = {
			type: this.type || 'dialog',
			controlledDialogId: this.controlledDialogId,
			focusAfterClose: this.button,
			focusAfterOpen: this.focusAfterOpen
		};
		this.button.dispatchEvent(new CustomEvent('dialogManager:open', { bubbles: true, detail: config}));
	}

	destroy() {
		this.button.removeEventListener('click', this.openDialog);
	}
}
