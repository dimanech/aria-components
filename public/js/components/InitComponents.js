export default class InitComponents {
	constructor() {
		this.pageComponents = {};
	}

	// This is global components initiator
	// it init all global components.
	// Composite components could initiate other components by themsels and control theirs lifecycle.

	addComponentToList(componentName, component) {
		if (/Manager/g.test(componentName)) {
			this.pageComponents[componentName] = component;
		}
	}

	loadAsync(domNode, componentName, callback) {
		import('/js/components/' + componentName + '.js')
				.then(module => {
					if (typeof module.default !== 'function') {
						console.log('Component could not be inited', componentName);
						return;
					}
					try {
						const component = new module.default(domNode, this.pageComponents);
						component.init();
						this.addComponentToList(componentName, component);
						callback();
					} catch (err) {
						// if default export not constructor
						module.default(domNode);
						callback();
					}
				})
				.catch(err => {
					console.log('Fetch error', componentName, err);
					callback();
				});
	}

	loadSync(domNode, componentName) {
		import('/js/components/' + componentName + '.js')
	}

	init(domNode, componentsList) {
		const componentName = domNode.getAttribute('data-widget');

		// if name -async then loading async and init
		// otherwise make if sync

		if (/-async/g.test(componentName)) {
			this.loadAsync(domNode, )
		} else {

		}

	}
}
