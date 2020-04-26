// NOT PRODUCTION READY! - add hot reload, load on demand and make async
import DiffDOM from '../libs/DiffDOM.js';
import { default as Mustache } from '../libs/Mustache.js';

let cachedTemplates = {};

/**
 * @param {HTMLElement} el
 * @param {HTMLElement} diffNode
 */
// eslint-disable-next-line class-methods-use-this
function applyDiff(el, diffNode) {
	/**
	 * @type {function[]}
	 */
	const dd = new DiffDOM({
		maxChildCount: false,
		filterOuterDiff(t1) {
			if (t1.attributes && t1.attributes['data-skip-render']) {
				// will not diff childNodes
				// eslint-disable-next-line no-param-reassign
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
}

export function render(templateId, data = {}, renderTo, strToRender) {
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
		const newHTMLDocument = document.implementation.createHTMLDocument('diffDOM');
		const diffNode = newHTMLDocument.createElement('div');

		diffNode.innerHTML = renderedStr;

		applyDiff(renderTo, diffNode);
	} else {
		console.error(`Missing el to render ${renderTo}`, this);
	}

	return Promise.resolve();
}
