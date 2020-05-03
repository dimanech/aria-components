import { getContentByUrl } from '../../utils/io.js';
import { render } from '../../utils/render.js';

// actions :
// update page
// update list
// append to list
// components:
// refinement
// sorting
// load more
// accordion
// tile alternative image
// aria feed

export default class ProductListingMgr {
	constructor(domNode) {
		this.plp = domNode.querySelector('[data-elem-plp-content]');
		this.list = domNode.querySelector('[data-elem-plp-grid]');
		this.filterButton = 'data-elem-plp-filter';
		this.sortingSelect = 'data-elem-plp-sort';
		this.loadMoreButton = 'data-elem-load-more';
		this.eventBus = document;
	}

	init() {
		this.addEventListeners();

		//window.onpopstate = event => this.updatePLP(event.state.url, event.state.message);
		// just returns fully rendered variant of page
	}

	addEventListeners() {
		this.loadMoreItems = this.loadMoreItems.bind(this);
		this.applySorting = this.applySorting.bind(this);
		this.applyFiltering = this.applyFiltering.bind(this);

		this.plp.addEventListener('click', this.loadMoreItems);
		this.plp.addEventListener('click', this.applyFiltering);
		this.plp.addEventListener('change', this.applySorting);
	}

	applyFiltering(event) {
		if (!this.isEventDelegatedFrom(this.filterButton, event)) {
			return;
		}
		const button = event.target;
		this.updatePLP(button.getAttribute('data-href'), button.textContent + ' filter applied');
	}

	applySorting(event) {
		if (!this.isEventDelegatedFrom(this.sortingSelect, event)) {
			return;
		}
		const select = event.target;
		this.updatePLP(select.value, select.options[select.selectedIndex].text + ' sorting applied', true);
	}

	loadMoreItems(event) {
		if (!this.isEventDelegatedFrom(this.loadMoreButton, event)) {
			return;
		}
		const button = event.target;
		const url = button.getAttribute('data-url');

		this.appendToProductsList(url, 'Loaded more products', button);
	}

	updatePLP(url, message, onlyProductsList) {
		this.toggleBusy(true);
		getContentByUrl(url).then(response => {
			const renderTo = onlyProductsList ? this.list : this.plp;
			const content = onlyProductsList ? this.getDocumentFragment(response, '[data-elem-plp-grid]') : response;

			render(undefined, undefined, renderTo, content).then(() => {
				//this.pushHistoryState('updatePLP', url, message);
				this.plp.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: message } }));
				this.eventBus.dispatchEvent(new Event('plp:updated'));
				this.toggleBusy(false);
			});
		}).catch(() => {
			this.toggleBusy(false);
		});
	}

	appendToProductsList(url, message, button) {
		button.classList.add('_loading');
		this.toggleBusy(true);
		getContentByUrl(url)
			.then(response => {
				button.parentElement.remove();

				this.list.insertAdjacentHTML('beforeend', response);

				//this.pushHistoryState('appendToProductsList', url, message);
				this.list.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: message} }));
				this.eventBus.dispatchEvent(new Event('plp:updated'));
			}).finally(() => {
				this.toggleBusy(false);
				button.classList.remove('_loading');
			});
	}

	pushHistoryState(action, url, message) {
		return history.pushState({
			'action': action,
			'url': url,
			'message': message
		}, '', url);
	}

	toggleBusy(isBusy) {
		this.plp.setAttribute('aria-busy', isBusy);
	}

	isEventDelegatedFrom(attributeName, event) {
		return event.target.getAttribute(attributeName) !== null;
	}

	getDocumentFragment(html, selector) {
		const fragment = new DocumentFragment();
		const node = document.createElement('div');
		node.innerHTML = html;
		fragment.appendChild(node);
		return fragment.querySelector(selector).outerHTML;
	}

	destroy() {
		this.plp.removeEventListener('click', this.loadMoreItems);
		this.plp.removeEventListener('click', this.applyFiltering);
		this.plp.removeEventListener('change', this.applySorting);
		window.onpopstate = null;
	}
}
