import Menubar from './Menubar.js';
import Hamburger from './HamburgerMenu.js';
import ComposeComponents from '../ComposeComponents.js';

export default class MainMenu {
	constructor(domNode, pageComponents) {
		this.menuList = document.querySelector('[data-js-nav]');
		this.menuBar = document.querySelector('[data-js-menu-bar]');
	}

	init() {
		if (this.menuList && this.menuBar) {
			new ComposeComponents(new Hamburger(this.menuList), 767, new Menubar(this.menuBar));
		}
	}
};
