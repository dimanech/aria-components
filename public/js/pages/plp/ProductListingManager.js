import { getContentByUrl } from '../../utils/ajax.js';
import { appendParamToURL } from '../../utils/url.js';
import { render } from '../../utils/render.js';

export default class ProductListingMgr {
	constructor(domNode, pageComponents) {
		this.pageComponents = pageComponents;
		this.content = domNode.querySelector('[data-js-plp-content]');
		this.grid = domNode.querySelector('[data-js-plp-grid]');
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

		this.content.addEventListener('click', this.loadMore);
		this.content.addEventListener('click', this.applyFiltering);
		this.content.addEventListener('change', this.applySorting);
	}

	updateByUrl(url, message) {
		this.toggleBusy(true);
		getContentByUrl(url).then(response => {
			render(undefined, undefined, this.content, response);
			this.content.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: message } }));
		}).finally(() => {
			this.toggleBusy(false);
		});
	}

	applyFiltering(event) {
		if (!this.isEventDelegatedFrom(this.filterButton, event)) {
			return;
		}
		const button = event.target;
		this.updateByUrl(button.getAttribute('data-href'), button.textContent + ' filter applied');
	}

	applySorting(event) {
		if (!this.isEventDelegatedFrom(this.sortingSelect, event)) {
			return;
		}
		const select = event.target;
		this.updateByUrl(select.value, select.options[select.selectedIndex].text + ' sorting applied');
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
					const tmpEl = document.createElement('div');
					tmpEl.innerHTML = response;
					this.grid.appendChild(tmpEl);
					this.grid.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: 'Loaded more products'} }));
				}).finally(() => {
					this.toggleBusy(false);
				});
	}

	toggleBusy(isBusy) {
		this.content.setAttribute('aria-busy', isBusy);
	}

	isEventDelegatedFrom(attributeName, event) {
		return event.target.getAttribute(attributeName) !== null;
	}

	destroy() {
		this.content.removeEventListener('click', this.loadMore);
		this.content.removeEventListener('click', this.applyFiltering);
		this.content.removeEventListener('change', this.applySorting);
	}
};
