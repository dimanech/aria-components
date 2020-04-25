import MenuPanelItem from './MenuPanelItem.js';

const keyCode = Object.freeze({
	ESC: 27,
});

// click on link, overlay,

export default class MenuPanel {
	constructor(domNode) {
		this.container = domNode;
		this.track = this.container.querySelector('[data-elem-hamburger-track]');
		this.mainMenu = this.container.querySelector('[data-elem-menu-bar]');

		this.subPanels = this.track.children;
		this.subPanelsCount = this.subPanels.length;
		this.subPanelsMenus = [];
		this.trackCurrentLevel = 0;

		this.TRANSITION_DELAY = 400;
	}

	init() {
		this.addEventListeners();
		this.moveTrackTo(0);
		this.initMenuItems();
	}

	addEventListeners() {
		this.back = this.back.bind(this);
		this.closeMenu = this.closeMenu.bind(this);
		this.openMenu = this.openMenu.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);

		this.track.addEventListener('keydown', this.handleKeydown);

		this.container.querySelectorAll('[data-elem-panel-back]').forEach(item => {
			item.addEventListener('click', this.back);
		});

		this.container.querySelectorAll('[data-elem-panel-close]').forEach(item => {
			item.addEventListener('click', this.closeMenu);
		});

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
		}, this.TRANSITION_DELAY);
	}

	back() {
		if (this.isPanelInTransition) {
			return;
		}
		this.isPanelInTransition = true;

		const requestedLevel = this.getPanelIndex(this.trackCurrentLevel - 1);
		this.moveTrackTo(requestedLevel);
		setTimeout(() => {
			this.subPanelsMenus[requestedLevel].setFocusToLastFocusedItem();
			this.isPanelInTransition = false;
		}, this.TRANSITION_DELAY);
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

	initMenuItems() {
		const subPanel = new MenuPanelItem(this.mainMenu, this);
		subPanel.init();

		this.subPanelsMenus[0] = subPanel;
	}

	initPanel(element, requestedLevel) {
		const subMenu = element.nextElementSibling;
		if (!subMenu) {
			return false;
		}

		this.subPanels[requestedLevel].setAttribute('aria-busy', true);
		const yeilds = this.subPanels[requestedLevel].querySelector('[data-elem-panel-yelds]');
		yeilds.innerHTML = subMenu.innerHTML;

		const subPanel = new MenuPanelItem(yeilds.firstElementChild, this); // TODO firstElementChild
		subPanel.init();

		this.subPanelsMenus[requestedLevel] = subPanel;

		this.subPanels[requestedLevel].setAttribute('aria-busy', false);
		return true;
	}

	setFocusToController(cmd) {
		const command = typeof cmd !== 'string' ? '' : cmd;

		if (command === 'previous') {
			this.back();
		}
		if (command === 'next') {
			this.forward();
		}
	}

	openMenu() {
		this.container.classList.add('_open');
		this.subPanelsMenus[0].setFocusToFirstItem();
	}

	closeMenu() {
		this.container.classList.remove('_open');
		this.resetHamburgerState();
	}

	resetHamburgerState() {
		this.timeout = setTimeout(() => {
			this.resetClasses();
			this.resetPanelsContent();
		}, this.TRANSITION_DELAY); // 400 panel animation delay
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
	}
}
