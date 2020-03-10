import { getContentByUrl } from '../../utils/ajax.js';
import { appendParamToURL } from '../../utils/url.js';
import { render } from '../../utils/render.js';
//import { Accordion } from '../../components/togglers/Accordion.js';
//import { GTM } from '../../components/analytics/GTM.js';

export default class ProductListingMgr {
	constructor(domNode, pageComponents) {
		this.productGrid = domNode.querySelector('[data-js-product-grid]');
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		this.loadMore = this.loadMore.bind(this);
		this.applySorting = this.applySorting.bind(this);
		this.applyFiltering = this.applyFiltering.bind(this);

		this.productGrid.addEventListener('click', this.loadMore);
		this.productGrid.addEventListener('click', this.applyFiltering);
		this.productGrid.addEventListener('change', this.applySorting);
	}

	updateByUrl(url, type) {
		this.toggleBusy(true);
		getContentByUrl(url).then(response => {
			render(undefined, undefined, this.productGrid, response);
		}).finally(() => {
			this.toggleBusy(false);
		});
	}

	applyFiltering(event) {
		if (!this.isEventDelegatedFrom('data-js-plp-filter', event)) {
			return;
		}
		this.updateByUrl(event.target.getAttribute('data-href'), 'filter');
	}

	applySorting(event) {
		if (!this.isEventDelegatedFrom('data-js-plp-sort', event)) {
			return;
		}
		this.updateByUrl(event.target.value, 'sorting');
	}

	loadMore(event) {
		if (!this.isEventDelegatedFrom('data-js-load-more', event)) {
			return;
		}
		const button = event.target;
		const url = button.getAttribute('data-url');
		button.classList.add('m-loading');

		this.toggleBusy(true);
		getContentByUrl(appendParamToURL(url, 'selectedUrl', url))
				.then(response => {
					button.remove();

					const tempEl = document.createElement('div');
					tempEl.innerHTML = response;
					this.productGrid.appendChild(tempEl);
				}).finally(() => {
					this.toggleBusy(false);
				});
	}

	toggleBusy(isBusy) {
		this.productGrid.classList.toggle('m-busy', isBusy);
		this.productGrid.setAttribute('aria-busy', isBusy);
	}

	isEventDelegatedFrom(attributeName, event) {
		return event.target.getAttribute(attributeName) !== null;
	}
};
