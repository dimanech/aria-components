export default class Notifier {
    constructor(domNode) {
        this.notifier = domNode;
        this.hideTimer = null;
    }

    init() {
        this.initRoles();
        this.initComponentReference();
    }

    destroy() {
        this.destroyComponentReference();
    }

    notify(message) {
        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
        }

        if (this.notifier.innerText === '') {
            this.notifier.innerText = message;
        } else {
            this.notifier.innerText += '\n' + message;
        }

        this.show();
    }

    show() {
        this.notifier.setAttribute('aria-hidden', 'false');
        this.hideTimer = window.setTimeout(this.hide.bind(this), 2000);
    }

    hide() {
        this.notifier.setAttribute('aria-hidden', 'true');
        this.notifier.innerText = '';
    }

    initRoles() {
        this.notifier.setAttribute('role', 'alert');
        this.notifier.setAttribute('aria-hidden', 'true');
    }

    initComponentReference() {
        this.notifier.widget = this;
    }

    destroyComponentReference() {
        delete this.notifier.widget;
    }
}
