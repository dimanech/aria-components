export default class HamburgerMenu {
    constructor(domNode) {
        this.domeNode = domNode;
        this.backBtn = this.domeNode.querySelector('[data-elem-nav-back]');

        this.trackCurrentLevel = 0;
        this.activePanels = [];

        this.forward = this.forward.bind(this);
        this.back = this.back.bind(this);
    }

    init() {
        this.initEventListeners();
    }

    initEventListeners() {
        this.resetHamburgerState = this.resetHamburgerState.bind(this);
        const hamburgerPanel = document.getElementById('hamburger-menu');

        this.domeNode.addEventListener('click', this.forward);
        this.backBtn.addEventListener('click', this.back);
        hamburgerPanel.addEventListener('dialog:closed', this.resetHamburgerState);
    }

    forward(e) {
        let clickedLink = e.target;
        if (clickedLink.parentElement.tagName === 'A') {
            clickedLink = clickedLink.parentElement;
        }
        if (!clickedLink.hasAttribute('data-elem-nav-to') ||
            !clickedLink.nextElementSibling ||
            !clickedLink.nextElementSibling.hasAttribute('data-elem-nav-flyout')) {
            return;
        }

        e.preventDefault();

        this.moveTrackTo(parseInt(clickedLink.getAttribute('data-elem-nav-to'), 10));
        this.activatePanel(clickedLink);
    }

    back(e) {
        e.preventDefault();

        if (this.trackCurrentLevel > 0) {
            this.moveTrackTo((this.trackCurrentLevel !== 9) ? this.trackCurrentLevel - 1 : 0);
        }
    }

    moveTrackTo(level) {
        const mainNavClasses = this.domeNode.classList;
        mainNavClasses.remove(`m-active_level_${this.trackCurrentLevel}`);
        mainNavClasses.add(`m-active_level_${level}`);
        this.trackCurrentLevel = level;
        this.domeNode.scrollTop = 0;

        this.toggleBackButton();
    }

    activatePanel(activeLink) {
        const panelRelatedToLink = activeLink.nextElementSibling;

        if (this.activePanels[this.trackCurrentLevel]) {
            this.activePanels[this.trackCurrentLevel].classList.remove('m-active');
        }

        panelRelatedToLink.classList.add('m-active');
        this.activePanels[this.trackCurrentLevel] = panelRelatedToLink;
    }

    toggleBackButton() {
        const backButtonClasses = this.backBtn.classList;

        if (this.trackCurrentLevel === 0 || this.trackCurrentLevel === 9) {
            backButtonClasses.remove('m-activated');
        } else {
            backButtonClasses.add('m-activated');
        }
    }

    resetHamburgerState() {
        this.timeout = setTimeout(() => {
            this.resetClasses();
            this.currentLevel = 0;
            this.openedPanel = null;
        }, 400); // 400 panel animation delay
    }

    resetClasses() {
        this.domeNode.classList.remove(`m-active_level_${this.trackCurrentLevel}`);
        this.activePanels.forEach(panel => panel.classList.remove('m-active'));
    }

    destroy() {
        this.domeNode.removeEventListener('click', this.forward);
        this.backBtn.removeEventListener('click', this.back);
        clearTimeout(this.timeout);
        document.body.removeEventListener('hamburger:close', this.resetHamburgerState);

        this.resetClasses();
    }
};
