import Tabs from './TabsUnified.js';
import Accordion from './AccordionUnified.js';
import ComponentsComposer from '../ComponentsComposer.js';

export default class TabsToAccordion {
	constructor(domNode) {
		this.tabList = domNode.querySelector('[data-elem-tablist]');
		this.accordionGroup = domNode;
	}

	init() {
		if (this.tabList && this.accordionGroup) {
			this.composer = new ComponentsComposer(new Accordion(this.accordionGroup), 767, new Tabs(this.tabList));
		}
	}

	destroy() {
		if (this.composer) {
			this.composer.destroy()
		}
	}
};
