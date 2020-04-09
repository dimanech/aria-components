/**
 * @description This is initiator for all global components. Eg: "data-component="
 * Composite components should initiate other components by themselves
 * using explicite imports and control theirs lifecycle.
 */
export default class ComponentsInitiator {
	constructor(loadedComponents) {
		this.pageComponents = {};
		this.loadedComponents = loadedComponents;
		this.componentsNames = this.loadedComponents.map(element => element[0]);
	}

	addComponentToList(componentName, component) {
		// Managers and Services should be available for other components (ex. Modal, Notification, Event)
		if (/Manager|Service/g.test(componentName)) {
			this.pageComponents[componentName] = component;
		}
	}

	loadAsync(domNode, componentName, callback) {
		import(/* webpackIgnore: true */componentName + '.js')
				.then(module => {
					if (typeof module.default !== 'function') {
						console.log('Component could not be inited', componentName);
						return;
					}
					try {
						const component = new module.default(domNode, this.pageComponents);
						component.init();
						callback();
					} catch (error) {
						console.log(error);
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

		const component = new this.loadedComponents[componentIndex][1](domNode, this.pageComponents);
		component.init();

		return component;
	}

	initComponent(domNode) {
		const componentName = domNode.getAttribute('data-component');

		if (/\//g.test(componentName)) {
			// if component has path in the name we load it async
			// eg. data-component="/js/components/togglers/Accordion" or relative to Initiator data-component="./togglers/Accordion"
			this.loadAsync(domNode, componentName, component => this.addComponentToList(componentName, component))
		} else {
			const component = this.loadSync(domNode, componentName);
			this.addComponentToList(componentName, component);
		}
	}
}
