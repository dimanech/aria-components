import Accordion from './Accordion.js';

export default class AccordionNoRoles extends Accordion {
	/**
	 * This class specially designed to be initiated on clear, unified base to cover case when
	 * several components could be initiated on same base. Ex: Tabs on desktop become Accordion on mobile.
	 */
	constructor(groupNode) {
		super(groupNode);
		this.buttons = Array.from(this.group.querySelectorAll('[data-aria-controls-acc]'));
	}

	init() {
		this.initRoles();
		super.init();
	}

	destroy() {
		super.destroy();
		this.destroyRoles();
	}

	initRoles() {
		this.buttons.forEach(button => {
			button.setAttribute('role', 'button');
			button.tabIndex = 0;
			button.setAttribute('aria-controls', button.getAttribute('data-aria-controls-acc'));
			button.setAttribute('aria-expanded', 'false');
			document.getElementById(button.getAttribute('data-aria-controls-acc')).setAttribute('role', 'region');
		});
	}

	destroyRoles() {
		this.buttons.forEach(button => {
			button.removeAttribute('role');
			button.tabIndex = -1;
			button.removeAttribute('aria-controls');
			button.removeAttribute('aria-expanded');
			const controlledSection = document.getElementById(button.getAttribute('data-aria-controls-acc'));
			controlledSection.removeAttribute('role');
			controlledSection.removeAttribute('aria-hidden');
		});
	}
}
