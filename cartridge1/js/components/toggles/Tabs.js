const keyCode = Object.freeze({
	RETURN: 13,
	SPACE: 32,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
});

export default class Tabs {
	/*
	 * Tabs
	 * Please see W3C specs https://www.w3.org/TR/wai-aria-practices/#tabpanel
	 *
	 * Configuration:
	 * `data-selection-follow-focus?=[true|false]` - Focused element will be selected it is default behaviour.
	 * In case if tab content dynamically loaded it is better to activate tab by click|Enter|Space for better UX.
	 * `data-preselect-tab="{HTMLElement.id}"` - Id of tab that should be selected on component init
	 * `aria-orientation=[vertical|horizontal]` - orientation of the tablist. This is for information only since
	 * in current implementation up/down arrows act alongside with left/right.
	 */
	constructor(tablist, config) {
		// elements
		this.tablist = tablist;
		this.tabs = Array.from(this.tablist.querySelectorAll('[role=tab]'));
		// options
		this.options = {
			selectionFollowFocus: (config && config.selectionFollowFocus) || !this.isSetToFalse(this.tablist.getAttribute('data-selection-follow-focus')),
			orientation: (config && config.orientation) || this.tablist.getAttribute('aria-orientation') || 'horizontal',
			preSelectTab: (config && config.preSelectTab) || this.tablist.getAttribute('data-preselect-tab')
		}
		// state
		this.selectedTab = null;
		this.focusedTab = null;
	}

	init() {
		this.addEventListeners();
		const activeTabIndex = this.options.preSelectTab ? this.getButtonIndex(document.getElementById(this.options.preSelectTab)) : 0;
		this.selectTab(this.tabs[activeTabIndex]);
	}

	destroy() {
		this.removeEventListeners();
	}

	addEventListeners() {
		this.handleClick = this.handleClick.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);

		this.tabs.forEach(tab => {
			tab.addEventListener('click', this.handleClick);
			tab.addEventListener('keydown', this.handleKeydown);
		});
	}

	removeEventListeners() {
		this.tabs.forEach(tab => {
			tab.removeEventListener('click', this.handleClick);
			tab.removeEventListener('keydown', this.handleKeydown);
		});
	}

	handleClick(event) {
		event.preventDefault();
		this.selectTab(event.target);
	}

	selectTab(tabNode) {
		if (!tabNode) { // since we expecting to init on empty tablist to fill it later
			return;
		}

		const isSelected = tabNode.getAttribute('aria-selected') === 'true';
		if (isSelected) {
			return; // Could exit earlier since only one tab from tablist could be selected
		}

		if (this.selectedTab) {
			Tabs.toggleTab(false, this.selectedTab);
		}
		Tabs.toggleTab(true, tabNode);
		this.selectedTab = tabNode;
		this.focusedTab = tabNode;
	}

	static toggleTab(isOpen, tabNode) {
		tabNode.setAttribute('aria-selected', isOpen);
		tabNode.setAttribute('tabindex', isOpen ? '0' : '-1');

		const controlledTabPanelNode = document.getElementById(tabNode.getAttribute('aria-controls'));
		if (!controlledTabPanelNode) {
			return;
		}
		controlledTabPanelNode.setAttribute('aria-hidden', !isOpen);
		controlledTabPanelNode.setAttribute('tabindex', isOpen ? '0' : '-1');

		tabNode.dispatchEvent(new Event('tab:' + (isOpen ? 'open': 'closed')));
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.SPACE:
				this.handleClick(event);
				break;
			case keyCode.RETURN:
				this.handleClick(event);
				break;
			case keyCode.RIGHT:
			case keyCode.DOWN:
				this.focusButtonByIndex(this.getButtonIndex(event.target) + 1);
				preventEventActions = true;
				break;
			case keyCode.LEFT:
			case keyCode.UP:
				this.focusButtonByIndex(this.getButtonIndex(event.target) - 1);
				preventEventActions = true;
				break;
			case keyCode.HOME:
				this.focusButtonByIndex(0);
				preventEventActions = true;
				break;
			case keyCode.END:
				this.focusButtonByIndex(-1);
				preventEventActions = true;
				break;
		}

		if (this.options.selectionFollowFocus) {
			this.selectTab(this.focusedTab);
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	getButtonIndex(domNode) {
		const index = this.tabs.indexOf(domNode);
		return index === -1 ? 0 : index;
	}

	focusButtonByIndex(requestedIndex) {
		const tabsTotal = this.tabs.length;
		let nextIndex;

		if (requestedIndex < 0) {
			nextIndex = (tabsTotal - 1);
		} else {
			nextIndex = requestedIndex % tabsTotal;
		}

		this.focusedTab = this.tabs[nextIndex];
		this.tabs[nextIndex].focus();
	}

	isSetToFalse(attr) {
		return attr !== null && attr === 'false';
	}
}
