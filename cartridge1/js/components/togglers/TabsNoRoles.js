import Tabs from './Tabs.js';

export default class TabsNoRoles extends Tabs {
	/**
     * This class specially designed to be initiated on clear, unified base to cover case when
     * several components could be initiated on same base. Ex: Tabs on desktop become Accordion on mobile.
     */
	constructor(tablist) {
		super(tablist);
		this.tabs = Array.from(this.tablist.querySelectorAll('[data-role=tab]'));
	}

	init() {
		this.initRoles();
		super.init();
	}

	destroy() {
		this.destroyRoles();
		super.destroy();
	}

	initRoles() {
		this.tablist.setAttribute('role', 'tablist');
		this.tabs.forEach(tab => {
			const controlledTabPanel = tab.getAttribute('data-aria-controls-tab');
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-controls', controlledTabPanel);
			tab.setAttribute('aria-selected', 'false');
			tab.setAttribute('tabindex', '-1');
			const controlledTabPanelNode = document.getElementById(controlledTabPanel);
			if (controlledTabPanelNode) {
				controlledTabPanelNode.setAttribute('role', 'tabpanel');
				controlledTabPanelNode.setAttribute('aria-hidden', 'true');
				controlledTabPanelNode.setAttribute('tabindex', '0');
			}
		});
	}

	destroyRoles() {
		this.tablist.removeAttribute('role');
		this.tabs.forEach(tab => {
			tab.removeAttribute('role');
			tab.removeAttribute('tabindex');
			tab.removeAttribute('aria-controls');
			tab.removeAttribute('aria-selected');
			tab.tabIndex = -1;
			const controlledTabPanel = document.getElementById(tab.getAttribute('data-aria-controls-tab'));
			if (controlledTabPanel) {
				controlledTabPanel.classList.remove('m-selected');
				controlledTabPanel.removeAttribute('aria-hidden');
				controlledTabPanel.removeAttribute('role');
				controlledTabPanel.removeAttribute('tabindex');
				controlledTabPanel.tabIndex = -1;
			}
		});
	}
}
