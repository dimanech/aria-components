import ScrollCarousel from './ScrollCarousel.js';

export default class ScrollCarouselGrub extends ScrollCarousel {
	constructor(domNode) {
		super(domNode);
	}

	init() {
		super.init();
		this.addAutoPlayEventListeners();
	}

	addEventListeners() {
		super.addEventListeners();
		this.addGrabEventListeners();
	}

	removeEventListeners() {
		super.removeEventListeners();
		this.removeGrabEventListeners();
	}

	addGrabEventListeners() {
		if (!this.isDirectionHorizontal) {
			return;
		}

		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);

		this.carouselTrack.addEventListener('mousedown', this.onTouchStart);
		this.carouselTrack.addEventListener('mouseup', this.onTouchEnd);
	}

	removeGrabEventListeners() {
		this.carouselTrack.removeEventListener('mousedown', this.onTouchStart);
		this.carouselTrack.removeEventListener('mouseup', this.onTouchEnd);
	}

	onTouchStart(event) {
		this.initialX = event.pageX || event.touches[0].pageX;
		this.carouselWidth = this.carousel.clientWidth;
		this.deltaX = 0;

		this.carouselTrack.addEventListener('mousemove', this.onTouchMove);
		this.carouselTrack.addEventListener('mouseleave', this.onTouchEnd);
		this.carouselTrack.classList.add('_grabbing');

		clearTimeout(this.grabbingRemoveTimeout);
	}

	onTouchMove(event) {
		const x = event.touches !== undefined ? event.touches[0].pageX : event.clientX;
		this.deltaX = (this.initialX - x) / this.carouselWidth * 100;

		this.carouselTrack.scrollTo({
			top: 0,
			left: this.carouselTrack.scrollLeft + this.deltaX
		});
	}

	onTouchEnd() {
		this.carouselTrack.removeEventListener('mousemove', this.onTouchMove);
		this.carouselTrack.removeEventListener('mouseleave', this.onTouchEnd);
		// we should remove scroll-snap-type with delay, otherwise it cause bouncing
		this.grabbingRemoveTimeout = setTimeout(() => this.carouselTrack.classList.remove('_grabbing'), 600);

		switch (true) {
			case (this.deltaX <= -10):
				// could not be scrollBy since user drug to scroll at the moment
				this.scrollToPrevPage();
				break;
			case (this.deltaX >= 10):
				this.scrollToNextPage();
				break;
			default:
				// remove immediate for this case
				this.carouselTrack.classList.remove('_grabbing');
		}

		this.deltaX = 0;
	}

	destroy() {
		super.destroy();
		this.disableAutoPlay();
	}
}
