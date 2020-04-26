import MenuPanelMenu from './MenuPanelMenu.js';

const keyCode = Object.freeze({
	TAB: 9,
	RETURN: 13,
	ESC: 27,
	SPACE: 32,
	UP: 38,
	DOWN: 40
});

export default class MenuPanel {
	constructor(domNode) {
		this.container = domNode;
		this.mainMenu = this.container.querySelector('[data-elem-menu-bar]');

		this.pushButton = document.querySelector('[data-elem-hamburger-open]');

		this.track = this.container.querySelector('[data-elem-hamburger-track]');
		this.trackCurrentLevel = 0;

		this.subPanels = this.track.children;
		this.subPanelsCount = this.subPanels.length;
		this.subPanelsMenus = [];

		this.selectorBack = 'data-elem-panel-back';
		this.selectorClose = 'data-elem-panel-close';
	}

	init() {
		this.mainMenu.setAttribute('role', 'menu');

		this.addEventListeners();
		this.initRootMenu();
	}

	addEventListeners() {
		this.backFromClick = this.backFromClick.bind(this);
		this.closeMenuFromClick = this.closeMenuFromClick.bind(this);
		this.openMenuPanel = this.openMenuPanel.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);

		this.pushButton.addEventListener('keydown', this.handleKeydown);

		this.track.addEventListener('keydown', this.handleKeydown);
		this.container.addEventListener('click', this.closeMenuFromClick);
		this.container.addEventListener('click', this.backFromClick);

		document.querySelectorAll('[data-elem-hamburger-open]').forEach(element => {
			element.addEventListener('click', this.openMenuPanel);
		});
	}

	removeEventListeners() {
		this.pushButton.removeEventListener('keydown', this.handleKeydown);

		this.track.removeEventListener('keydown', this.handleKeydown);
		this.container.removeEventListener('click', this.closeMenuFromClick);
		this.container.removeEventListener('click', this.backFromClick);

		document.querySelectorAll('[data-elem-hamburger-open]').forEach(element => {
			element.removeEventListener('click', this.openMenuPanel);
		});
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

		this.toggleBusy(true, requestedLevel);
		if (!this.initPanel(element, requestedLevel)) {
			this.toggleBusy(false, requestedLevel);
			return;
		}
		this.moveTrackTo(requestedLevel);

		this.waitForTransitionEnd(this.track, () => {
			this.toggleBusy(false, requestedLevel);
			const currentMenu = this.subPanelsMenus[requestedLevel];
			currentMenu.setFocusToFirstItem();
			currentMenu.currentMenuItem.domNode.setAttribute('aria-expanded', true);
			this.isPanelInTransition = false;
		})
	}

	back() {
		if (this.isPanelInTransition) {
			return;
		}
		this.isPanelInTransition = true;

		const requestedLevel = this.getPanelIndex(this.trackCurrentLevel - 1);
		this.moveTrackTo(requestedLevel);

		this.waitForTransitionEnd(this.track,() => {
			const currentMenu = this.subPanelsMenus[requestedLevel];
			currentMenu.setFocusToCurrentItem();
			currentMenu.currentMenuItem.domNode.setAttribute('aria-expanded', false);
			this.isPanelInTransition = false;
		});
	}

	moveTrackTo(requestedLevel) {
		const mainNavClasses = this.track.classList;
		mainNavClasses.remove(`_level-${this.trackCurrentLevel + 1}`);
		mainNavClasses.add(`_level-${requestedLevel + 1}`);

		this.trackCurrentLevel = requestedLevel;
		this.track.scrollTop = 0;
	}

	getPanelIndex(level) {
		return (level < 0 ? 0 : level) % this.subPanelsCount;
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

		const subPanelContent = this.subPanels[requestedLevel].querySelector('[data-elem-panel-yields]');
		subPanelContent.innerHTML = subMenu.innerHTML;

		const subPanel = new MenuPanelMenu(subPanelContent, this);
		subPanel.init();
		this.subPanelsMenus[requestedLevel] = subPanel;

		return true;
	}

	resetPanelsState() {
		this.waitForTransitionEnd(this.track,() => {
			this.resetClasses();
			this.resetPanelsContent();
			this.moveTrackTo(0);
		});
	}

	resetClasses() {
		this.track.classList.remove(`_level-${this.trackCurrentLevel + 1}`);
	}

	resetPanelsContent() {
		for (let i = 1; i < this.subPanelsCount; i++) {
			this.subPanels[i].innerHtml = '';
		}
	}

	toggleBusy(isBusy, level) {
		this.subPanels[level].setAttribute('aria-busy', isBusy);
	}

	// Push button

	setExpanded(isExpanded) {
		this.pushButton.setAttribute('aria-expanded', isExpanded.toString());
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.SPACE:
			case keyCode.RETURN:
			case keyCode.DOWN:
				this.openMenuPanel();
				this.waitForTransitionEnd(this.track,() => this.subPanelsMenus[0].setFocusToFirstItem());
				preventEventActions = true;
				break;

			case keyCode.UP:
				this.openMenuPanel();
				this.waitForTransitionEnd(this.track,() => this.subPanelsMenus[0].setFocusToLastItem());
				preventEventActions = true;
				break;

			case keyCode.TAB:
			case keyCode.ESC:
				this.closeMenuPanel();
				this.pushButton.focus();
				break;

			default:
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	// Container

	openMenuPanel() {
		this.setExpanded(true);
		this.container.classList.add('_open');
		this.waitForTransitionEnd(this.container, () => this.subPanelsMenus[0].setFocusToFirstItem());
	}

	closeMenuPanel() {
		this.setExpanded(false);
		this.container.classList.remove('_open');
		this.resetPanelsState();
	}

	closeMenuFromClick(event) {
		const element = event.target;
		if (element === this.container || element.hasAttribute(this.selectorClose)) {
			event.preventDefault();
			this.closeMenuPanel();
		}
	}

	waitForTransitionEnd(container, callback) {
		const onEnd = () => {
			clearTimeout(this.transitionFallbackTimer);
			container.removeEventListener('transitionend', onEnd);
			callback();
		}
		const onRun = () => {
			container.removeEventListener('transitionrun', onRun);
			container.addEventListener('transitionend', onEnd);
		}

		container.addEventListener('transitionrun', onRun);
		this.transitionFallbackTimer = setTimeout(onEnd, 800);
	}

	destroy() {
		clearTimeout(this.transitionFallbackTimer);
		this.removeEventListeners();
		this.resetPanelsState();
		this.mainMenu.removeAttribute('role');
	}
}
