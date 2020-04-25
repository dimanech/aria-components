import Menu from './PopupMenu.js';

export default class MenuBarPopupMenu extends Menu {
	constructor(domNode, controllerComponent) {
		super(domNode, controllerComponent);
	}

	setFocusToController(cmd) {
		const command = typeof cmd !== 'string' ? '' : cmd;

		if (command === '') {
			if (this.controller && this.controller.domNode) {
				// focus controller node and handle event on his side
				this.controller.domNode.focus();
			}
			return;
		}

		if (command === 'previous') {
			this.controller.menuBar.setFocusToPreviousItem(this.controller);
		}

		if (command === 'next') {
			this.controller.menuBar.setFocusToNextItem(this.controller);
		}
	}
}
