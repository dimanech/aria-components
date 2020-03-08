import { listenBreakpointChange } from '../utils/media.js';

export default class ComponentsComposer {
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
};
