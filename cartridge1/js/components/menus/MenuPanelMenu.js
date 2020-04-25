import Menu from './Menu.js';

export default class MenuPanelMenu extends Menu {
	constructor(domNode, controllerComponent) {
		super(domNode, controllerComponent);
	}

	setFocusToController(cmd, menuItem) {
		const command = typeof cmd !== 'string' ? '' : cmd;

		if (command === 'previous') {
			this.controller.back();
		}

		if (command === 'next') {
			if (menuItem.hasSubMenu) {
				this.menuItems.domNode.setAttribute('aria-expanded', true);
				this.controller.forward(menuItem.domNode);
			}
		}
	}
}
