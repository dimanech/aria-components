import Menubar from './Menubar.js';
import Hamburger from './HamburgerMenu.js';
import ComponentsComposer from '../ComponentsComposer.js';

export default class MainMenu {
	constructor(domNode, pageComponents) {
		this.menuList = document.querySelector('[data-js-nav]');
		this.menuBar = document.querySelector('[data-js-menu-bar]');
	}

	init() {
		if (this.menuList && this.menuBar) {
			this.composer = new ComponentsComposer(new Hamburger(this.menuList), 767, new Menubar(this.menuBar));
		}
	}

	destroy() {
		if (this.composer) {
			this.composer.destroy()
		}
	}
};
