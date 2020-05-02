export default class ScrollCarousel {
	constructor(domNode) {
		this.carousel = domNode;
		this.carouselTrack = this.carousel.querySelector('[data-elem-carousel-track]');
		this.prevButton = this.carousel.querySelector('[data-elem-prev-button]');
		this.nextButton = this.carousel.querySelector('[data-elem-next-button]');

		this.isDirectionHorizontal = this.carousel.getAttribute('data-direction') !== 'vertical';
		this.currentPage = 0;

		this.scrollEndSensitivity = 40; // Workaround IE rounding for clientWidth and scrollWidth
	}

	init() {
		this.addEventListeners();
		this.onScroll();
		this.updateCarouselState();
		this.initPagination();
		this.carousel.classList.add('_inited');
	}

	addEventListeners() {
		this.onScroll = this.onScroll.bind(this);
		this.prevPage = this.prevPage.bind(this);
		this.nextPage = this.nextPage.bind(this);

		this.carouselTrack.addEventListener('scroll', this.onScroll, { passive: true });
		this.carouselTrack.addEventListener('touchstart', this.onScroll, { passive: true });
		this.prevButton.addEventListener('click', this.prevPage);
		this.nextButton.addEventListener('click', this.nextPage);
	}

	removeEventListeners() {
		this.carouselTrack.removeEventListener('scroll', this.onScroll);
		this.carouselTrack.removeEventListener('touchstart', this.onScroll);
		this.prevButton.removeEventListener('click', this.prevPage);
		this.nextButton.removeEventListener('click', this.nextPage);
	}

	// Prev next buttons and UI
	onScroll() {
		this.updateCarouselMetric();

		if (!this.isCallInNextFrameRequested) {
			window.requestAnimationFrame(this.scrollHandlers.bind(this));
			this.isCallInNextFrameRequested = true;
		}
	}

	updateCarouselMetric() {
		// Possible optimization: Resize Observer that watch carousel width and cache this.carousel.offsetWidth
		if (this.isDirectionHorizontal) {
			const totalScrollWidth = this.carouselTrack.scrollLeft + this.carousel.offsetWidth;
			this.isScrollStart = this.carouselTrack.scrollLeft <= 0;
			this.isScrollEnd = totalScrollWidth + this.scrollEndSensitivity >= this.carouselTrack.scrollWidth;
		} else {
			const totalScrollHeight = this.carouselTrack.scrollTop + this.carousel.offsetHeight;
			this.isScrollStart = this.carouselTrack.scrollTop <= 0;
			this.isScrollEnd = totalScrollHeight + this.scrollEndSensitivity >= this.carouselTrack.scrollHeight;
		}
	}

	scrollHandlers() {
		this.updateCarouselState();
		if (this.pagination) {
			this.setActivePagination();
			this.scrollActivePaginationIntoView();
		}
		this.isCallInNextFrameRequested = false;
	}

	updateCarouselState() {
		if (this.isScrollStart && this.isScrollEnd) { // No scroll case
			this.carousel.classList.add('_no-scroll');
		} else {
			this.carousel.classList.remove('_no-scroll');
		}

		if (this.isScrollStart) {
			this.carousel.classList.remove('_prev-visible');
			this.prevButton.setAttribute('disabled', 'true');
		} else {
			this.carousel.classList.add('_prev-visible');
			this.prevButton.removeAttribute('disabled');
		}

		if (this.isScrollEnd) {
			this.carousel.classList.remove('_next-visible');
			this.nextButton.setAttribute('disabled', 'true');
		} else {
			this.carousel.classList.add('_next-visible');
			this.nextButton.removeAttribute('disabled');
		}
	}

	// Prev next functionality

	// relative scroll - page by page
	prevPage() {
		this.scrollBy();
	}

	nextPage() {
		this.scrollBy(true);
	}

	scrollBy(isNext) {
		const x = this.isDirectionHorizontal ? this.carouselTrack.clientWidth : 0;
		const y = this.isDirectionHorizontal ? 0 : this.carouselTrack.clientHeight;

		if (isNext) {
			this.carouselTrack.scrollBy(x, y);
		} else {
			this.carouselTrack.scrollBy(-x, -y);
		}
	}

	// abs scroll - page to page
	getCurrentPageIndex() {
		const currentPosition = this.isDirectionHorizontal
			? this.carouselTrack.scrollLeft : this.carouselTrack.scrollTop;
		const pageWidth = this.isDirectionHorizontal
			? this.carouselTrack.clientWidth : this.carouselTrack.clientHeight;
		return Math.round(currentPosition / pageWidth);
	}

	scrollToNextPage() {
		this.scrollToPage(this.getCurrentPageIndex() + 1);
	}

	scrollToPrevPage() {
		this.scrollToPage(this.getCurrentPageIndex() - 1);
	}

	scrollToPage(pageIndex) {
		if (pageIndex < 0) {
			return;
		}

		if (this.isDirectionHorizontal) {
			this.scrollToPoint(0, Math.round(this.carousel.clientWidth * pageIndex));
		} else {
			this.scrollToPoint(Math.round(this.carousel.clientHeight * pageIndex), 0);
		}
	}

	scrollToPoint(top, left, node) {
		let element = node || this.carouselTrack;
		// Safari and Edge do not have smooth scrolling please use polyfill or just leave it as is
		// If you still using jQuery you could call $.animate()
		if (typeof element.scrollTo === 'function' && 'scrollBehavior' in document.documentElement.style) {
			element.scrollTo({
				top: top,
				left: left,
				behavior: 'smooth'
			});
		} else {
			if (this.isDirectionHorizontal) {
				element.scrollLeft = left;
			} else {
				element.scrollTop = top;
			}
		}
	}

	// Pagination

	initPagination() {
		if (!this.carousel.hasAttribute('data-pagination')) {
			return;
		}
		const paginationOption = this.carousel.getAttribute('data-pagination');
		if (paginationOption) {
			this.pagination = document.getElementById(paginationOption);
		} else {
			this.createPaginationElements();
		}
		this.pagination.onclick = this.handlePaginationClick.bind(this);
		this.setActivePagination();
	}

	destroyPagination() {
		if (this.pagination) {
			this.pagination.onclick = null;

			if (this.carousel.getAttribute('data-pagination') === '') { // existed pagination
				this.carousel.removeChild(this.pagination);
			}
		}
	}

	createPaginationElements() {
		const hasPagination = !!this.pagination;
		// We need to use round, not ceil, since it called on scroll, in case of last it would generate falls positive
		const numberOfPages = Math.round(this.carouselTrack.scrollWidth / this.carouselTrack.clientWidth);

		if (!hasPagination) {
			this.pagination = document.createElement('div');
			this.pagination.className = 'pagination';
		} else {
			this.pagination.innerHTML = '';
		}

		for (let i = 0; i < numberOfPages; i++) {
			const page = document.createElement('button');
			page.className = 'page';
			page.setAttribute('data-page', i);
			page.tabIndex = -1;
			this.pagination.appendChild(page);
		}

		if (!hasPagination) {
			this.carousel.appendChild(this.pagination);
		}
	}

	setActivePagination() {
		this.pagination.children[this.currentPage].classList.remove('_current'); // should be here because reinit pagination could change pages count

		const currentPageIndex = Math.round(this.carouselTrack.scrollLeft / this.carousel.clientWidth);
		let currentPageNode = this.pagination.children[currentPageIndex];
		// TODO: recreate pagination if pages become less or more that on init
		currentPageNode.classList.add('_current');

		this.currentPage = currentPageIndex;
	}

	scrollActivePaginationIntoView() {
		// In case if pagination has scroll itself we scroll pagination into view. Ex: if pagination is thumbnails
		if (this.pagination.scrollHeight === this.pagination.offsetHeight) {
			return;
		}

		const currentPageNode = this.pagination.children[this.currentPage];

		if (currentPageNode.offsetTop > this.pagination.clientHeight) {
			this.scrollToPoint(this.pagination.scrollTop + this.pagination.clientHeight, 0, this.pagination);
		}
		if (currentPageNode.offsetTop < this.pagination.scrollTop) {
			this.scrollToPoint(this.pagination.scrollTop - this.pagination.clientHeight, 0, this.pagination);
		}
	}

	handlePaginationClick(event) {
		event.preventDefault();
		const pageIndex = event.target.getAttribute('data-page');
		if (!pageIndex) {
			return;
		}
		this.scrollToPage(parseInt(pageIndex, 10));
	}

	// Destroy

	destroy() {
		this.removeEventListeners();
		this.destroyPagination();
	}
}
