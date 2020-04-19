export default class ScrollCarousel {
	constructor(domNode) {
		this.slider = domNode;
		this.prevButton = this.slider.querySelector('[data-elem-prev-button]');
		this.nextButton = this.slider.querySelector('[data-elem-next-button]');

		this.currentPage = 0;
	}

	init() {

	}

	addEventListeners() {

	}
}
