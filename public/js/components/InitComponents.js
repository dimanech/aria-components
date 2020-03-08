export default class InitComponents {
	constructor(loadedComponents) {
		this.pageComponents = {};
		this.loadedComponents = loadedComponents;
		this.componentsNames = this.loadedComponents.map(element => element[0]);
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
		const componentIndex = this.componentsNames.indexOf(componentName);

		if (componentIndex === -1) {
			console.warn(`"${componentName}" present on page, but it is import not found!`);
			return;
		}

		const component = new this.loadedComponents[componentIndex][1](domNode, this.componentsList);
		component.init();

		return component;
	}

	initComponent(domNode) {
		const componentName = domNode.getAttribute('data-widget');

		if (/-async/g.test(componentName)) {
			this.loadAsync(domNode, componentName, component => this.addComponentToList(componentName, component))
		} else {
			const component = this.loadSync(domNode, componentName);
			this.addComponentToList(componentName, component);
		}
	}
}
