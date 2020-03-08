import { DiffDOM } from 'diff-dom/dist/index';
import Mustache from 'mustache';

function saveTemplateForHotReload(renderTo, template) {
	if (!PRODUCTION) { // save template in element for hot reload
		const tmpEl = renderTo.get();
		if (tmpEl) {
			tmpEl[templateProp] = template;
		}
	}
}

/**
 *
 * @param {HTMLElement} el
 * @param {HTMLElement} diffNode
 */
// eslint-disable-next-line class-methods-use-this
function applyDiff(el, diffNode) {
	/**
	 * @type {function[]}
	 */
	const delayedAttrModification = [];
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
					['removeAttribute', 'addAttribute', 'modifyAttribute'].includes(action)
					&& typeof name === 'string'
					&& name.startsWith('data-') // handle only data attr changes
					&& info.node instanceof HTMLElement
			) {
				const node = getFromRoute(el, info.diff.route);
				if (node) {
					// data-initialized should be executed at last point
					delayedAttrModification[name === 'data-initialized' ? 'push' : 'unshift'](getDelayedCallback(action, node, info));
				}
			}
		}
	});
	const diff = dd.diff(el, diffNode.firstElementChild);
	if (diff && diff.length) {
		// console.log(diff);
		dd.apply(el, diff);
	}
	// report attr modification once app changes are applied
	delayedAttrModification.forEach(action => action());
}

export default function render(templateRefId = 'template', data = {}, renderTo = this.ref('self'), strToRender = '') {
	// eslint-disable-next-line complexity
	if (!this.cachedTemplates) {
		/** @type {{[x: string]: string|undefined}} */
		this.cachedTemplates = {};
	}

	let template = this.cachedTemplates && this.cachedTemplates[templateRefId];

	if (!strToRender && !template) {
		const templateElement = this.ref(templateRefId).get();

		if (templateElement) {
			template = templateElement.innerHTML;
			Mustache.parse(template);
			this.cachedTemplates[templateRefId] = template;

			saveTemplateForHotReload(renderTo, template);
		} else {
			// eslint-disable-next-line no-lonely-if
			if (!PRODUCTION) {
				const tmpEl = renderTo.get();
				if (tmpEl && tmpEl[templateProp]) {
					template = tmpEl[templateProp];
				} else {
					log.error(`Unable find template ${templateRefId}`, this);
					return Promise.reject(new Error(`Unable find template ${templateRefId}`));
				}
				log.error(`Unable find template ${templateRefId}`, this);
				return Promise.reject(new Error(`Unable find template ${templateRefId}`));
			}
		}
	}

	const renderedStr = strToRender || Mustache.render(template, data);
	const el = renderTo.get();

	if (el && el.parentNode) {
		// use new document to avoid loading images when diffing
		const newHTMLDocument = document.implementation.createHTMLDocument('diffDOM');
		const diffNode = /** @type {HTMLElement} */(newHTMLDocument.createElement('div'));

		diffNode.innerHTML = renderedStr;// .replace(/<!--.*?-->/ig, '');

		this.applyDiff(el, diffNode);
	} else {
		log.error(`Missing el to render ${templateRefId}`, this);
	}

	return Promise.resolve();
}
