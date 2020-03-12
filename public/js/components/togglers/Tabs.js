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
    constructor(tablist) {
        this.tablist = tablist;
        this.tabs = Array.from(this.tablist.querySelectorAll('[role=tab]'));
        this.selectedTab = null;
        this.selectionFollowFocus = !this.hasFalseValue(this.tablist.getAttribute('data-selection-follow-focus'));
        this.orientation = this.tablist.getAttribute('aria-orientation') || 'horizontal';
        this.preSelectTab = this.tablist.getAttribute('[aria-selected=true]');
        this.keyCode = keyCode;
    }

    init() {
        this.addEventListeners();
        this.addComponentReference();
        if (this.preSelectTab && document.getElementById(this.preSelectTab)) {
            this.selectTab(this.getButtonIndex(document.getElementById(this.preSelectTab)));
        } else {
            this.selectTab(this.tabs[0]);
        }
    }

    destroy() {
        this.removeEventListeners();
        this.removeComponentReference();
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

    addComponentReference() {
        this.tablist.widget = this;
    }

    removeComponentReference() {
        delete this.tablist.widget;
    }

    handleClick(event) {
        event.preventDefault();
        this.selectTab(event.target);
    }

    selectTab(tab) {
        if (!tab) { // since we expecting to init on empty tablist to fill it later
            return;
        }

        const isSelected = tab.getAttribute('aria-selected') === 'true';
        if (isSelected) {
            return; // Could exit earlier since only one tab from tablist could be selected
        }

        Tabs.closeTab(this.selectedTab);
        Tabs.openTab(tab);
        this.selectedTab = tab;
        this.focusedTab = tab;
    }

    static closeTab(tab) {
        if (!tab) {
            return;
        }

        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        tab.classList.remove('m-selected');

        const controlledTabPanel = document.getElementById(tab.getAttribute('aria-controls'));
        if (controlledTabPanel) {
            controlledTabPanel.setAttribute('aria-hidden', 'true');
            controlledTabPanel.removeAttribute('tabindex');
            tab.dispatchEvent(new CustomEvent('tab:closed', { bubbles: true, cancelable: true }));
        }
    }

    static openTab(tab) {
        if (!tab) {
            return;
        }

        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        tab.classList.add('m-selected');

        const controlledTabPanel = document.getElementById(tab.getAttribute('aria-controls'));
        if (controlledTabPanel) {
            controlledTabPanel.setAttribute('aria-hidden', 'false');
            controlledTabPanel.setAttribute('tabindex', 0);
            tab.dispatchEvent(new CustomEvent('tab:open', { bubbles: true, cancelable: true }));
        }
    }

    addTab() {
    }

    removeTab() {
    }

    handleKeydown(event) {
        const key = event.which || event.keyCode;
        let preventEventActions = false;

        switch (key) {
            case this.keyCode.SPACE:
                this.handleClick(event);
                break;
            case this.keyCode.RETURN:
                this.handleClick(event);
                break;
            case this.keyCode.RIGHT:
            case this.keyCode.DOWN:
                this.focusButtonByIndex(this.getButtonIndex(event.target) + 1);
                preventEventActions = true;
                break;
            case this.keyCode.LEFT:
            case this.keyCode.UP:
                this.focusButtonByIndex(this.getButtonIndex(event.target) - 1);
                preventEventActions = true;
                break;
            case this.keyCode.HOME:
                this.focusButtonByIndex(0);
                preventEventActions = true;
                break;
            case this.keyCode.END:
                this.focusButtonByIndex(-1);
                preventEventActions = true;
                break;
        }

        if (this.selectionFollowFocus) {
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
        const buttonsLength = this.tabs.length;
        let nextIndex;

        if (requestedIndex < 0) {
            nextIndex = (buttonsLength - 1);
        } else {
            nextIndex = requestedIndex % buttonsLength;
        }

        this.focusedTab = this.tabs[nextIndex];
        this.tabs[nextIndex].focus();
    }

    hasFalseValue(attr) {
        return attr !== null && attr === 'false';
    }
};
