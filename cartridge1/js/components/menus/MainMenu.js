import ComponentsComposer from '../ComponentsComposer.js';
import MenuBar from './MenuBar.js';
import Hamburger from './MenuPanel.js';

export default class MainMenu {
	constructor(domNode) {
		this.menuPanel = domNode;
		this.menuBar = document.querySelector('[data-elem-menu-bar]');
	}

	init() {
		if (this.menuPanel && this.menuBar) {
			this.composer = new ComponentsComposer(new Hamburger(this.menuPanel), 767, new MenuBar(this.menuBar));
		}
	}

	destroy() {
		if (this.composer) {
			this.composer.destroy();
		}
	}
}
