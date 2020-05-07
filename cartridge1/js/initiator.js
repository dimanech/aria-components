import ComponentsInitiator from './components/ComponentsInitiator.js';
import ComponentsObserver from './components/ComponentsObserver.js';

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
	const initComponent = node => initiator.initComponent(node);

	document.querySelectorAll('[data-component]').forEach(initComponent);
	new ComponentsObserver({ onAddedComponents: initComponent });

})();
