export default class ScrollCarousel {
	constructor(domNode) {
		this.carousel = domNode;
		this.prevButton = this.carousel.querySelector('[data-elem-prev-button]');
		this.nextButton = this.carousel.querySelector('[data-elem-next-button]');

		this.currentPage = 0;
	}

	init() {

	}

	addEventListeners() {

	}
}
