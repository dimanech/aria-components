export default class SnapScrollCarouselVertical extends SnapScrollCarousel {
	constructor(domNode) {
		super(domNode);
	}

	onScroll() {
		const totalScrollHeight = this.carouselTrack.scrollTop + this.carousel.offsetHeight;
		this.scrollStart = this.carouselTrack.scrollTop <= 0;
		this.scrollEnd = totalScrollHeight + this.scrollEndSensitivity >= this.carouselTrack.scrollHeight;

		if (!this.requestedCallInNextFrame) {
			window.requestAnimationFrame(this.scrollHandlers.bind(this));
			this.requestedCallInNextFrame = true;
		}
	}

	next() {
		this.scrollToPoint(this.carouselTrack.scrollTop + this.carouselTrack.clientHeight, 0);
	}

	prev() {
		this.scrollToPoint(this.carouselTrack.scrollTop - this.carouselTrack.clientHeight, 0);
	}

	// Pagination
	handlePaginationClick(event) {
		super.handlePaginationClick();
		this.scrollToPoint(Math.round(this.carousel.clientHeight * pageIndex), 0);
	}
}
