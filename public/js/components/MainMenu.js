import Menubar from './menus/Menubar.js';
import Hamburger from './menus/HamburgerMenu.js';
import ComposeComponents from './utils/ComposeComponents.js';

export default class MainMenu {
	constructor(props) {
		this.menuList = document.querySelector('[data-js-nav]');
		this.menuBar = document.querySelector('[data-js-menu-bar]');
	}

	init() {
		if (this.menuList && this.menuBar) {
			new ComposeComponents(new Hamburger(this.menuList), 767, new Menubar(this.menuBar));
		}
	}
};
