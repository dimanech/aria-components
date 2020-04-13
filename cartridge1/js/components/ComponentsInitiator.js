/**
 * @description This is initiator for all global components. Eg: "data-component="
 * Composite components should initiate other components by themselves
 * using explicit imports and control theirs lifecycle.
 */
export default class ComponentsInitiator {
	constructor(loadedComponents) {
		this.pageComponents = {};
		this.loadedComponents = loadedComponents;
		this.componentsNames = this.loadedComponents.map(element => element[0]);
	}

	addComponentToList(componentName, component) {
		// Managers and Services should be available for other components (ex. Modal, Notification, Event)
		// NB: not all pageComponents could not be available during init of component because of:
		// a) you component could be higher in DOM tree than other manager
		// b) some manager could be loaded async
		if (/Manager|Service/g.test(componentName)) {
			this.pageComponents[componentName] = component;
		}
	}

	async loadAsync(componentName) {
		const module = await import(/* webpackIgnore: true */componentName + '.js');

		if (typeof module.default !== 'function') {
			console.error('Initiator: Default export not a function', componentName);
		}

		return module.default;
	}

	loadSync(componentName) {
		const componentIndex = this.componentsNames.indexOf(componentName);

		if (componentIndex === -1) {
			console.warn(`Initiator: "${componentName}" present on page, but it is import not found!`);
			return;
		}

		return this.loadedComponents[componentIndex][1];
	}

	async initComponent(domNode) {
		const componentName = domNode.getAttribute('data-component');

		let componentConstructor;

		if (/\//g.test(componentName)) {
			// if component has path in the name we load it async
			// eg. data-component="/js/components/togglers/Accordion" or relative to Initiator data-component="./togglers/Accordion"
			componentConstructor = await this.loadAsync(componentName).catch(err => console.error('Initiator:', err, componentName));
		} else {
			componentConstructor = this.loadSync(componentName);
		}

		if (!componentConstructor) {
			return;
		}

		let component;
		try {
			component = new componentConstructor(domNode, this.pageComponents);
			component.init();
		} catch (error) {
			console.error(componentName, error);
			// if default export not constructor
			component = componentConstructor(domNode, this.pageComponents);
		}

		domNode.setAttribute('data-inited', true);
		this.addComponentToList(componentName, component);
	}
}
