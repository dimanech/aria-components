import Menu from './Menu.js';

export default class MenuPanelMenu extends Menu {
	constructor(domNode, controllerComponent) {
		super(domNode, controllerComponent);
	}

	setFocusToController(cmd, menuItem) {
		const command = typeof cmd !== 'string' ? '' : cmd;

		if (command === 'previous') {
			this.controller.back(menuItem.domNode);
		}

		if (command === 'next') {
			this.next(menuItem);
		}
	}

	menuItemClick(menuItem) {
		this.setFocusToItem(menuItem);
		this.next(menuItem);
	}

	next(menuItem) {
		if (menuItem.hasSubMenu) {
			this.controller.forward(menuItem.domNode);
		}
	}
}
