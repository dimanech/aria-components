// NOT PRODUCTION READY! - add hot reload
import DiffDOM from '../libs/DiffDOM.js';
import Mustache from '../libs/Mustache.js';

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
		}
	});
	const diff = dd.diff(el, diffNode.firstElementChild);
	if (diff && diff.length) {
		// console.log(diff);
		dd.apply(el, diff);
	}
}

export default function render(templateId, data = {}, renderTo, strToRender) {
	if (!this.cachedTemplates) {
		this.cachedTemplates = {};
	}

	let template = this.cachedTemplates && this.cachedTemplates[templateId];
	const templateElement = document.getElementById(templateId);

	if (!strToRender && templateElement) {
		template = templateElement.innerHTML;
		Mustache.parse(template);
		this.cachedTemplates[templateId] = template;
	}

	const renderedStr = strToRender || Mustache.render(template, data);

	if (renderTo && renderTo.parentNode) {
		// use new document to avoid loading images when diffing
		const newHTMLDocument = document.implementation.createHTMLDocument('diffDOM');
		const diffNode = /** @type {HTMLElement} */(newHTMLDocument.createElement('div'));

		diffNode.innerHTML = renderedStr;// .replace(/<!--.*?-->/ig, '');

		applyDiff(renderTo, diffNode);
	} else {
		console.error(`Missing el to render ${renderTo}`, this);
	}

	return Promise.resolve();
}
