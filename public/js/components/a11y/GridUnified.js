import Grid from './Grid.js';

export default class GridUnified extends Grid {
    constructor(domNode) {
        super(domNode);
    }

    init() {
        this.setupRoles();
        super.init();
    }

    setupRoles() {
        if (!this.domNode.hasAttribute('data-role')) {
            return;
        }

        this.domNode.parentElement.querySelectorAll('[data-role]').forEach(node =>
            node.setAttribute('role', node.getAttribute('data-role')));
    }

    destroyRoles() {
        if (!this.domNode.hasAttribute('data-role')) {
            return;
        }

        this.domNode.parentElement.querySelectorAll('[data-role]').forEach(node =>
            node.removeAttribute('role'));
    }

    destroy() {
        this.destroyRoles();
        super.destroy();
    }
};
