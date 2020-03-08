import ComponentsInitiator from './components/ComponentsInitiator.js';

(async function() {
	let loadedComponents = [];

	const commonComponents = await import(/* webpackChunkName: "common" */ './components-aggregation-common.js');
	loadedComponents = loadedComponents.concat(commonComponents.default);

	switch (window.appScope) {
		case 'plp':
			const plpComponents = await import(/* webpackChunkName: "plp" */ './components-aggregation-plp.js');
			loadedComponents = loadedComponents.concat(plpComponents.default);
			break;
		default:
	}

	const initiator = new ComponentsInitiator(loadedComponents);
	document.querySelectorAll('[data-widget]')
			.forEach(node => initiator.initComponent(node));
})();
