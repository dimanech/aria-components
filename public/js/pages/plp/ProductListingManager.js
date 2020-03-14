import { getContentByUrl } from '../../utils/ajax.js';
import { appendParamToURL } from '../../utils/url.js';
import { render } from '../../utils/render.js';

export default class ProductListingMgr {
	constructor(domNode, pageComponents) {
		this.pageComponents = pageComponents;
		this.productGrid = domNode.querySelector('[data-js-plp-content]');
		this.filterButton = 'data-js-plp-filter';
		this.sortingSelect = 'data-js-plp-sort';
		this.loadMoreButton = 'data-js-load-more';
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

	updateByUrl(url, message) {
		this.toggleBusy(true);
		getContentByUrl(url).then(response => {
			render(undefined, undefined, this.productGrid, response);
			this.productGrid.dispatchEvent(new CustomEvent('notifier:notify', { detail: message }));
		}).finally(() => {
			this.toggleBusy(false);
		});
	}

	applyFiltering(event) {
		if (!this.isEventDelegatedFrom(this.filterButton, event)) {
			return;
		}
		this.updateByUrl(event.target.getAttribute('data-href'), this.filterButton.text + ' filter applied');
	}

	applySorting(event) {
		if (!this.isEventDelegatedFrom(this.sortingSelect, event)) {
			return;
		}
		this.updateByUrl(event.target.value, 'sorting applied');
	}

	loadMore(event) {
		if (!this.isEventDelegatedFrom(this.loadMoreButton, event)) {
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
					this.productGrid.dispatchEvent(new CustomEvent('notifier:notify', { detail: 'Loaded more products' }));
				}).finally(() => {
					this.toggleBusy(false);
				});
	}

	toggleBusy(isBusy) {
		this.productGrid.setAttribute('aria-busy', isBusy);
	}

	isEventDelegatedFrom(attributeName, event) {
		return event.target.getAttribute(attributeName) !== null;
	}

	destroy() {
		this.productGrid.removeEventListener('click', this.loadMore);
		this.productGrid.removeEventListener('click', this.applyFiltering);
		this.productGrid.removeEventListener('change', this.applySorting);
	}
};
