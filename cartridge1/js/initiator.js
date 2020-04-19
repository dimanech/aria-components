import ComponentsInitiator from './components/ComponentsInitiator.js';

(async function() {
	let loadedComponents = [];

	const commonComponents = await import(/* webpackChunkName: "common" */ './components-aggregation-common.js');
	loadedComponents = loadedComponents.concat(commonComponents.default);

	switch (window.appScope) {
		case 'plp':
			loadedComponents = loadedComponents.concat(await import(/* webpackChunkName: "plp" */ './components-aggregation-plp.js').default);
			break;
		default:
	}

	const initiator = new ComponentsInitiator(loadedComponents);
	document.querySelectorAll('[data-component]')
			.forEach(node => initiator.initComponent(node));
})();
