import { listenBreakpointChange } from '../utils/media.js';

export default class ComponentsComposer {
	/**
	 * @description This component designed to compose 2 components into that is
	 * switchable on different breakpoints. It could be initialized on same nodes
	 * or use different nodes as hosts.
	 * See MainMenu or TabsToAccordion as examples.
	 * @example
	 * this.composer = new ComponentsComposer(new MenuPanel(this.menuPanel), 767, new MenuBar(this.menuBar));
	 *
	 * @param {function} before - constructor of component that should be below breakpoint
	 * @param {number} breakpoint - viewport width that used as breakpoint
	 * @param {function} after - constructor of component that should be after breakpoint
	 */
	constructor(before, breakpoint, after) {
		this.desktopComponent = after;
		this.mobileComponent = before;
		this.breakpoint = breakpoint;
		this.desktopComponentInited = false;
		this.mobileComponentInited = false;

		this.init();
	}

	init() {
		if (window.innerWidth >= this.breakpoint) {
			this.initDesktopComponent();
		} else {
			this.initMobileComponent();
		}

		this.addEventListeners();
	}

	initDesktopComponent() {
		this.desktopComponent.init();
		this.desktopComponentInited = true;
	}

	initMobileComponent() {
		this.mobileComponent.init();
		this.mobileComponentInited = true;
	}

	toggleComponents() {
		if (window.innerWidth >= this.breakpoint) {
			if (this.mobileComponentInited) {
				this.mobileComponent.destroy();
				this.mobileComponentInited = false;
			}
			if (!this.desktopComponentInited) {
				this.initDesktopComponent();
			}
		} else {
			if (this.desktopComponentInited) {
				this.desktopComponent.destroy();
				this.desktopComponentInited = false;
			}
			if (!this.mobileComponentInited) {
				this.initMobileComponent();
			}
		}
	}

	addEventListeners() {
		listenBreakpointChange(this.toggleComponents.bind(this));
	}

	destroy() {
		if (this.desktopComponentInited) {
			this.desktopComponent.destroy();
		}
		if (this.mobileComponentInited) {
			this.mobileComponent.destroy();
		}
	}
}
