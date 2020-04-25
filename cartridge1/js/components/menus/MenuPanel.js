import MenuPanelMenu from './MenuPanelMenu.js';

const keyCode = Object.freeze({
	ESC: 27,
	TAB: 9
});

// overlay and close, aria-expanded, esc

export default class MenuPanel {
	constructor(domNode) {
		this.container = domNode;
		this.track = this.container.querySelector('[data-elem-hamburger-track]');
		this.mainMenu = this.container.querySelector('[data-elem-menu-bar]');

		this.subPanels = this.track.children;
		this.subPanelsCount = this.subPanels.length;
		this.subPanelsMenus = [];
		this.trackCurrentLevel = 0;

		this.animationDelay = 400;
		this.selectorBack = 'data-elem-panel-back';
		this.selectorClose = 'data-elem-panel-close';
	}

	init() {
		this.mainMenu.setAttribute('role', 'menu');

		this.addEventListeners();
		this.moveTrackTo(0);
		this.initRootMenu();
	}

	addEventListeners() {
		this.backFromClick = this.backFromClick.bind(this);
		this.forwardFromClick = this.forwardFromClick.bind(this);
		this.closeMenuFromClick = this.closeMenuFromClick.bind(this);
		this.openMenu = this.openMenu.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);

		this.track.addEventListener('keydown', this.handleKeydown);
		this.container.addEventListener('click', this.closeMenuFromClick);
		this.container.addEventListener('click', this.forwardFromClick);
		this.container.addEventListener('click', this.backFromClick);

		document.querySelectorAll('[data-elem-hamburger-open]').forEach(item => {
			item.addEventListener('click', this.openMenu);
		});
	}

	handleKeydown(event) {
		event.preventDefault();
		switch (event.keyCode) {
			case keyCode.ESC:
			case keyCode.TAB:
				this.closeMenu();
				break;
			default:
				break;
		}
	}

	forwardFromClick(event) {
		const element = event.target;
		if (element.getAttribute('aria-haspopup') !== 'true') {
			return;
		}
		event.preventDefault();
		this.forward(element);
	}

	backFromClick(event) {
		const element = event.target;
		if (!element.hasAttribute(this.selectorBack)) {
			return;
		}
		event.preventDefault();
		this.back();
	}

	forward(element) {
		if (this.isPanelInTransition) {
			return;
		}
		this.isPanelInTransition = true;

		const requestedLevel = this.getPanelIndex(this.trackCurrentLevel + 1);
		if (!this.initPanel(element, requestedLevel)) {
			return;
		}
		this.moveTrackTo(requestedLevel);
		setTimeout(() => {
			this.subPanelsMenus[requestedLevel].setFocusToFirstItem();
			this.isPanelInTransition = false;
		}, this.animationDelay);
	}

	back() {
		if (this.isPanelInTransition) {
			return;
		}
		this.isPanelInTransition = true;

		const requestedLevel = this.getPanelIndex(this.trackCurrentLevel - 1);
		this.moveTrackTo(requestedLevel);
		setTimeout(() => {
			this.subPanelsMenus[requestedLevel].setFocusToCurrentItem();
			this.isPanelInTransition = false;
		}, this.animationDelay);
	}

	moveTrackTo(requestedLevel) {
		const mainNavClasses = this.track.classList;
		mainNavClasses.remove(`_level-${this.trackCurrentLevel + 1}`);
		mainNavClasses.add(`_level-${requestedLevel + 1}`);

		this.trackCurrentLevel = requestedLevel;
		this.track.scrollTop = 0;
	}

	getPanelIndex(level) {
		let requestedLevel = level % this.subPanelsCount;

		if (requestedLevel < 0) { // TODO
			requestedLevel = 0;
		}

		return requestedLevel;
	}

	initRootMenu() {
		const subPanel = new MenuPanelMenu(this.mainMenu, this);
		subPanel.init();

		this.subPanelsMenus[0] = subPanel;
	}

	initPanel(element, requestedLevel) {
		const subMenu = element.nextElementSibling;
		if (!subMenu) {
			return false;
		}

		this.subPanels[requestedLevel].setAttribute('aria-busy', true);
		const subPanelContent = this.subPanels[requestedLevel].querySelector('[data-elem-panel-yields]');
		subPanelContent.innerHTML = subMenu.innerHTML;

		const subPanel = new MenuPanelMenu(subPanelContent, this);
		subPanel.init();

		this.subPanelsMenus[requestedLevel] = subPanel;

		this.subPanels[requestedLevel].setAttribute('aria-busy', false); // TODO: when transition ends
		return true;
	}

	openMenu() {
		this.container.classList.add('_open');
		this.subPanelsMenus[0].setFocusToFirstItem();
	}

	closeMenu() {
		this.container.classList.remove('_open');
		this.resetHamburgerState();
	}

	closeMenuFromClick(event) {
		const element = event.target;
		if (!element.hasAttribute(this.selectorClose)) {
			return;
		}
		event.preventDefault();
		this.closeMenu();
	}

	resetHamburgerState() {
		this.timeout = setTimeout(() => {
			this.resetClasses();
			this.resetPanelsContent();
		}, this.animationDelay); // 400 panel animation delay
	}

	resetClasses() {
		this.track.classList.remove(`_level-${this.trackCurrentLevel + 1}`);
	}

	resetPanelsContent() {
		for (let i = 1; i < this.subPanelsCount; i++) {
			this.subPanels[i].innerHtml = '';
		}
	}

	destroy() {
		clearTimeout(this.timeout);
		this.resetClasses();
		this.mainMenu.removeAttribute('role');
	}
}
