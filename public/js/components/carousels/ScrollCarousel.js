export default class ScrollCarousel {
	constructor(domNode) {
		this.carousel = domNode;
		this.carouselTrack = this.carousel.querySelector('[data-elem-carousel-track]');
		this.prevButton = this.carousel.querySelector('[data-elem-prev-button]');
		this.nextButton = this.carousel.querySelector('[data-elem-next-button]');

		this.carouselDirection = this.carousel.getAttribute('data-direction') || 'horizontal';
		this.currentPage = 0;

		this.scrollEndSensitivity = 40; // Workaround IE rounding for clientWidth and scrollWidth
	}

	init() {
		this.addEventListeners();
		this.onScroll();
		this.updateCarouselState();
		this.initPagination();
		this.carousel.classList.add('_inited');
		this.afterInit();
	}

	afterInit() {}

	addEventListeners() {
		this.onScroll = this.onScroll.bind(this);
		this.prev = this.prev.bind(this);
		this.next = this.next.bind(this);

		this.carouselTrack.addEventListener('scroll', this.onScroll, { passive: true });
		this.carouselTrack.addEventListener('touchstart', this.onScroll, { passive: true });
		this.prevButton.addEventListener('click', this.prev);
		this.nextButton.addEventListener('click', this.next);

		this.addDragEventListeners();
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
		// TODO: optimize. Cache metric of slider and add window width change watcher
		if (this.carouselDirection === 'horizontal') {
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

	getCurrentPageIndex() {
		const currentPosition = this.carouselDirection === 'horizontal' ? this.carouselTrack.scrollLeft : this.carouselTrack.scrollTop;
		const pageWidth = this.carouselDirection === 'horizontal' ? this.carouselTrack.clientWidth : this.carouselTrack.clientHeight;
		return Math.ceil(currentPosition / pageWidth);
	}

	next() {
		if (this.carouselDirection === 'horizontal') {
			this.scrollToPoint(0, (this.getCurrentPageIndex() + 1) * this.carouselTrack.clientWidth);
		} else {
			this.scrollToPoint((this.getCurrentPageIndex() + 1) * this.carouselTrack.clientHeight, 0);
		}
	}

	prev() {
		if (this.carouselDirection === 'horizontal') {
			this.scrollToPoint(0, (this.getCurrentPageIndex() - 1) * this.carouselTrack.clientWidth);
		} else {
			this.scrollToPoint((this.getCurrentPageIndex() - 1) * this.carouselTrack.clientHeight, 0);
		}
	}

	scrollToPoint(top, left, node) {
		let element = node || this.carouselTrack;
		// Safari and Edge do not have smooth scrolling please use polyfill or just leave it as is
		if (typeof element.scrollTo === 'function' && 'scrollBehavior' in document.documentElement.style) {
			element.scrollTo({
				top: top,
				left: left,
				behavior: 'smooth'
			});
		} else {
			if (this.carouselDirection === 'horizontal') {
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
		if (paginationOption === '') {
			this.createPaginationElements();
		} else {
			this.pagination = document.getElementById(paginationOption);
		}
		this.pagination.onclick = this.handlePaginationClick.bind(this);
		this.setActivePagination();
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
		const currentPageIndex = Math.round(this.carouselTrack.scrollLeft / this.carousel.clientWidth);
		const currentPageNode = this.pagination.children[currentPageIndex];
		if (!currentPageNode) {
			this.initPagination();
		}

		this.pagination.children[this.currentPage].classList.remove('_current');
		currentPageNode.classList.add('_current');

		this.currentPage = currentPageIndex;
	}

	scrollActivePaginationIntoView() {
		// In case if pagination has scroll itself we scroll pagination into view. Ex. if pagination is thumbnails
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
		const eventTarget = event.target;
		let pageIndex = eventTarget.getAttribute('data-page');
		if (!pageIndex) {
			return;
		}
		if (this.carouselDirection === 'horizontal') {
			this.scrollToPoint(0, Math.round(this.carousel.clientWidth * pageIndex));
		} else {
			this.scrollToPoint(Math.round(this.carousel.clientHeight * pageIndex), 0);
		}
	}

	// Drag and drop

	addDragEventListeners() {
		// Drag functionality
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);

		this.carouselTrack.addEventListener('mousedown', this.onTouchStart);
		this.carouselTrack.addEventListener('touchstart', this.onTouchStart, { passive: true });
		this.carouselTrack.addEventListener('mouseup', this.onTouchEnd);
		this.carouselTrack.addEventListener('touchend', this.onTouchEnd, { passive: true });
		this.carouselTrack.addEventListener('dragstart', this.onDragStart);
	}

	onDragStart(event) {
		event.preventDefault();
	}

	onTouchMove(event) {
		const x = event.touches !== undefined ? event.touches[0].pageX : event.clientX;
		this.deltaX = (this.initialX - x) / this.windowWidth * 70;

		this.carouselTrack.scrollTo({
			top: 0,
			left: this.carouselTrack.scrollLeft + this.deltaX,
		});
	}

	onTouchStart(event) {
		this.initialX = event.pageX || event.touches[0].pageX;
		this.windowWidth = this.carousel.clientWidth; //window.innerWidth;
		this.deltaX = 0;

		this.carouselTrack.addEventListener('mousemove', this.onTouchMove);
		this.carouselTrack.addEventListener('touchmove', this.onTouchMove);
		this.carouselTrack.addEventListener('mouseleave', this.onTouchEnd);
		this.carouselTrack.classList.add('_grabbing');
	}

	onTouchEnd() {
		this.carouselTrack.removeEventListener('mousemove', this.onTouchMove);
		this.carouselTrack.removeEventListener('touchmove', this.onTouchMove);
		this.carouselTrack.removeEventListener('mouseleave', this.onTouchEnd);
		this.carouselTrack.classList.remove('_grabbing');

		switch (true) {
			case (this.deltaX <= -8):
				this.prev();
				break;
			case (this.deltaX >= 8):
				this.next();
				break;
			default:
		}

		this.deltaX = 0;
	}

	// Destroy

	destroy() {
		this.carouselTrack.removeEventListener('scroll', this.onScroll);
		this.carouselTrack.removeEventListener('touchstart', this.onScroll);
		this.prevButton.removeEventListener('click', this.prev);
		this.nextButton.removeEventListener('click', this.next);
		if (this.pagination) {
			if (this.carousel.getAttribute('data-pagination') !== '') { // existed pagination
				this.pagination.addEventListener('click', this.handlePaginationClick);
			} else {
				this.carousel.removeChild(this.pagination);
			}
		}
		this.afterDestroy();
	}

	afterDestroy() {}
}
