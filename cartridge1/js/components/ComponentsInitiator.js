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

	async importComponent(name) {
		const module = await import(/* webpackIgnore: true */name + '.js');

		if (typeof module.default !== 'function') {
			console.warn('[ComponentsInitiator]: Could not init. Default export not a function ', name);
			return;
		}

		return module.default;
	}

	getComponent(name) {
		const componentIndex = this.componentsNames.indexOf(name);

		if (componentIndex === -1) {
			console.warn(`[ComponentsInitiator]: Could not init. "${name}" component present on page, but it import not found`);
			return;
		}

		return this.loadedComponents[componentIndex][1];
	}

	async getConstructor(name) {
		let constructor;

		if (/\//g.test(name)) {
			// if component has path in the name we load it async
			// eg. data-component="/js/components/toggles/Accordion" or relative to Initiator data-component="./toggles/Accordion"
			constructor = await this.importComponent(name)
				.catch(err => console.error('[ComponentsInitiator]:', err, name));
		} else {
			constructor = this.getComponent(name);
		}

		return constructor;
	}

	async initComponent(domNode) {
		const name = domNode.getAttribute('data-component');

		const constructor = await this.getConstructor(name);
		if (!constructor) {
			return;
		}

		let component;
		try {
			component = new constructor(domNode, this.pageComponents);
			component.init();
		} catch (error) {
			console.groupCollapsed(`[ComponentsInitiator]:\x1b[31m ${name}.js ${error.name}: ${error.message}`);
			console.error(error);
			console.groupEnd();
		}

		domNode.setAttribute('data-inited', true);
		this.addComponentToList(name, component);
	}
}
