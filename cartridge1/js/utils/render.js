// NOT PRODUCTION READY! - add hot reload, load on demand and make async
let cachedTemplates = {};

/**
 * @param {HTMLElement} el
 * @param {HTMLElement} diffNode
 */
function applyDiff(el, diffNode) {
	return import(/* webpackChunkName: 'DiffDOM' */ '../libs/DiffDOM.js').then(module => {
		const DiffDOM = module.default;

		const dd = new DiffDOM({
			maxChildCount: false,
			filterOuterDiff(t1) {
				if (t1.attributes && t1.attributes['data-skip-render']) {
					// will not diff childNodes
					t1.innerDone = true;
				}
			},
			postDiffApply(info) {
				const { action, name } = info.diff;
				if (
					['removeAttribute', 'addAttribute', 'modifyAttribute'].includes(action) &&
					typeof name === 'string' &&
					name.startsWith('data-') && // handle only component changes
					info.node instanceof HTMLElement
				) {
					// init new added component
					//console.log(info.diff)
				}
			}
		});

		const diff = dd.diff(el, diffNode.firstElementChild);

		if (diff && diff.length) {
			dd.apply(el, diff);
		}
	});
}

export function render(templateId, data = {}, renderTo, strToRender) {
	return import(/* webpackChunkName: 'Mustache' */ '../libs/Mustache.js').then(Mustache => {
		let template = cachedTemplates && cachedTemplates[templateId];
		const templateElement = document.getElementById(templateId);

		if (!strToRender && templateElement) {
			template = templateElement.innerHTML;
			Mustache.parse(template);
			cachedTemplates[templateId] = template;
		}

		const renderedStr = strToRender || Mustache.render(template, data);

		if (renderTo && renderTo.parentNode) {
			// use new document to avoid loading images when diffing
			const newHTMLDocument = document.implementation.createHTMLDocument('diffDOM'); // TODO: change to template
			const diffNode = newHTMLDocument.createElement('div');

			diffNode.innerHTML = renderedStr;

			applyDiff(renderTo, diffNode);
		} else {
			console.error(`Missing el to render ${renderTo}`, this);
		}

		return Promise.resolve();
	});
}
