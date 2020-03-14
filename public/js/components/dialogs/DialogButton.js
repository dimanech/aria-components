export default class DialogButton {
	constructor(domNode, pageComponents) {
		this.button = domNode;
		this.dialogManager = pageComponents.dialogManager;
		this.controlledModalId = this.button.getAttribute('aria-controls');
		this.focusAfterOpen = this.button.getAttribute('data-focus-in-modal');
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		if (this.controlledModalId === null) {
			return;
		}

		this.openDialog = this.openDialog.bind(this);
		this.button.addEventListener('click', this.openDialog);
	}

	openDialog(event) {
		event.preventDefault();

		this.dialogManager.openDialog(
				'modal',
				this.controlledModalId,
				this.button,
				this.focusAfterOpen
		);
	}

	destroy() {
		this.button.removeEventListener('click', this.openDialog);
	}
}
