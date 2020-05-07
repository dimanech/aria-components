export default class ComponentsObserver {
	constructor(actions) {
		this.onAddedComponents = actions.onAddedComponents;

		this.initMutationObserver();
	}

	initMutationObserver() {
		this.observer = new MutationObserver(mutations =>
			mutations.forEach(mutation => this.handleMutations(mutation)));

		this.observer.observe(document.body, {
			attributes: false,
			characterData: false,
			childList: true,
			subtree: true
		});
	}

	handleMutations(mutation) {
		mutation.addedNodes.forEach(addedNode => {
			if (addedNode.nodeType === addedNode.ELEMENT_NODE
				&& document.body.contains(addedNode)
				&& addedNode.hasAttribute('data-component')
				&& !addedNode.hasAttribute('data-inited')
			) {
				this.onAddedComponents(addedNode);
			}
		});
	}
}
