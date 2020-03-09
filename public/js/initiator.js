import ComponentsInitiator from './components/ComponentsInitiator.js';

import('./components-aggregation-main.js')
		.then(module => {
			const loadedComponents = module.default;
			const initiator = new ComponentsInitiator(loadedComponents);

			document.querySelectorAll('[data-widget]')
					.forEach(node => initiator.initComponent(node));
		});
