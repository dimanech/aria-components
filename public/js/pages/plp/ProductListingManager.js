import { getContentByUrl } from '../../utils/ajax.js';
import { appendParamToURL } from '../../utils/url.js';
import { render } from '../../utils/render.js';
import GoogleAddresses from '../../components/forms/GoogleAddresses.js';
import Accordion from '../../components/togglers/Accordion.js';
//import { GTM } from '../../components/analytics/GTM.js';

export default class ProductListingMgr {
	constructor(domNode, pageComponents) {
		this.pageComponents = pageComponents;
		this.productGrid = domNode.querySelector('[data-js-product-grid]');
		this.refinments = domNode.querySelector('[data-js-refinments]');
		this.filterButton = 'data-js-plp-filter';
		this.sortingSelect = 'data-js-plp-sort';
		this.loadMoreButton = 'data-js-load-more';

		this.placesInput = document.getElementById('places');
	}

	init() {
		this.addEventListeners();
		this.initGooglePlaces();
		this.initAccordion();
	}

	addEventListeners() {
		this.loadMore = this.loadMore.bind(this);
		this.applySorting = this.applySorting.bind(this);
		this.applyFiltering = this.applyFiltering.bind(this);

		this.productGrid.addEventListener('click', this.loadMore);
		this.productGrid.addEventListener('click', this.applyFiltering);
		this.productGrid.addEventListener('change', this.applySorting);
	}

	initGooglePlaces() {
		// pass to GoogleAddresses constructor for autocomplete inputs
		//const formInfo = {
		//	address: this.address1Input,
		//	postal_code: this.postalCodeInput,
		//	city: this.cityInput,
		//	country: '',
		//	state: this.stateCodeInput
		//};
		this.places = new GoogleAddresses(this.placesInput, this.pageComponents);
		this.places.init();
	}

	initAccordion() {
		this.accordion = new Accordion(this.refinments, );
		this.accordion.init();
	}

	updateByUrl(url, type) {
		this.toggleBusy(true);
		getContentByUrl(url).then(response => {
			render(undefined, undefined, this.productGrid, response);
			this.accordion.reinit();
		}).finally(() => {
			this.toggleBusy(false);
		});
	}

	applyFiltering(event) {
		if (!this.isEventDelegatedFrom(this.filterButton, event)) {
			return;
		}
		this.updateByUrl(event.target.getAttribute('data-href'), 'filter');
	}

	applySorting(event) {
		if (!this.isEventDelegatedFrom(this.sortingSelect, event)) {
			return;
		}
		this.updateByUrl(event.target.value, 'sorting');
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

	destroy() {
		this.productGrid.removeEventListener(this.loadMore);
		this.productGrid.removeEventListener(this.applyFiltering);
		this.productGrid.removeEventListener(this.applySorting);

		this.places.destroy();
		this.accordion.destroy();
	}
};
