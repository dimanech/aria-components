(function () {
	let pageComponents = {};

	function addComponentToList(componentName, component) {
		//if (/Mgr/g.test(componentName)) {
		//	// push singletones
		//	pageComponents[componentName] = component;
		//}
		if (pageComponents[componentName]) {
			if (pageComponents[componentName].length) {
				pageComponents[componentName].push(component);
				return;
			}
			const componentsArray = [];
			componentsArray.push(pageComponents[componentName]);
			componentsArray.push(component);
			pageComponents[componentName] = componentsArray;
		} else {

			pageComponents[componentName] = component;
		}
	}

	function initComponent(domNode) {
		const componentName = domNode.getAttribute('data-atomic-widget');

		import("/js/components/" + componentName + '.js')
				.then(module => {
					if (typeof module.default !== 'function') {
						console.log('Component could not be inited', componentName);
						return;
					}
					try {
						const component = new module.default(domNode, pageComponents);
						component.init();
						addComponentToList(componentName, component);
					} catch (err) {
						module.default(domNode);
					}
				}).catch(err => {
			console.log('Fetch error', componentName, err)
		});
	}

	document.querySelectorAll('[data-atomic-widget]')
			.forEach(node => initComponent(node));

	console.log(pageComponents)
}());

