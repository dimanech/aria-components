import ComponentsInitiator from './components/ComponentsInitiator.js';

(async function() {
	let loadedComponents = [];
	let componentsSet = [];

	componentsSet = await import(/* webpackChunkName: "common" */ './components-aggregation-common.js');
	loadedComponents = loadedComponents.concat(componentsSet.default);

	switch (window.appScope) {
		case 'plp':
			componentsSet = await import(/* webpackChunkName: "plp" */ './components-aggregation-plp.js');
			loadedComponents = loadedComponents.concat(componentsSet.default);
			break;
		default:
	}

	const initiator = new ComponentsInitiator(loadedComponents);
	document.querySelectorAll('[data-component]')
			.forEach(node => initiator.initComponent(node));
})();
