const keyCode = Object.freeze({
	LEFT: 37,
	RIGHT: 39,
});

export default class ContentSlider {
	constructor(domNode) {
		this.slider = domNode;
		this.sliderContent = this.slider.querySelector('[data-elem-content]')
		this.paginationContent = this.slider.querySelector('[data-elem-dots]')
		this.prevButton = this.slider.querySelector('[data-elem-prev-button]');
		this.nextButton = this.slider.querySelector('[data-elem-next-button]');

		this.currentSlideIndex = 0;
		this.slidesModel = [];
	}

	init() {
		this.initStructure();

		if (this.slidesTotal <= 1) {
			console.log('Only one slide is present. Slider do not inited')
			return;
		}
		if (this.slidesTotal === 2) {
			// bad case - instead of 2 slides we should have 4
			this.cloneSlides();
			this.initStructure();
		}

		this.initPagination();
		this.goToSlide(0);
		this.addEventListeners();
		this.slider.classList.add('_inited');
	}

	initStructure() {
		this.slides = this.sliderContent.children;
		this.slidesTotal = this.slides.length;
	}

	cloneSlides() {
		const initialContent = this.sliderContent.innerHTML;
		this.sliderContent.innerHTML = initialContent + initialContent;
	}

	addEventListeners() {
		this.goToNextSlide = this.goToNextSlide.bind(this);
		this.goToPrevSlide = this.goToPrevSlide.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);

		this.nextButton.addEventListener('click', this.goToNextSlide);
		this.prevButton.addEventListener('click', this.goToPrevSlide);
		this.slider.addEventListener('keydown', this.handleKeydown);
	}

	removeEventListeners() {
		this.nextButton.removeEventListener('click', this.goToNextSlide);
		this.prevButton.removeEventListener('click', this.goToPrevSlide);
	}

	goToNextSlide() {
		this.goToSlide(this.currentSlideIndex + 1);
	}

	goToPrevSlide() {
		this.goToSlide(this.currentSlideIndex - 1);
	}

	goToSlide(index) {
		if (this.blockedByAnimations) {
			return;
		}

		const newSlide = this.normalizeIndex(index);
		this.slidesModel = this.getSlidesModel(newSlide);
		this.addTransitionEndListener();
		this.applySlidesModel();
		this.setActivePagination(newSlide);
		this.currentSlideIndex = newSlide;
	}

	applySlidesModel() {
		const allClasses = ['_prev', '_next', '_current'];
		let n = 0;

		while (n < this.slidesTotal) { // NB: sparsed array
			const slideElement = this.slides[n];
			const slideClass = this.slidesModel[n];

			slideElement.classList.remove(...allClasses);
			if (slideClass) {
				slideElement.classList.add(slideClass);
			}

			n++;
		}
	}

	getSlidesModel(requestedIndex) {
		let model = new Array(this.slidesTotal);
		const nextIndex = this.normalizeIndex(requestedIndex + 1);
		const prevIndex = this.normalizeIndex(requestedIndex - 1);
		const currentIndex = this.normalizeIndex(requestedIndex);

		model[currentIndex] = '_current';
		model[nextIndex] = '_next';
		model[prevIndex] = '_prev';

		return model;
	}

	normalizeIndex(index) {
		if (index < 0) {
			return (this.slidesTotal - 1);
		} else {
			return index % this.slidesTotal;
		}
	}

	addTransitionEndListener() {
		this.blockedByAnimations = true;
		this.transitionEndTimeout = setTimeout(this.removeTransitionEndListener.bind(this), 300);
		this.sliderContent.setAttribute('aria-live', 'polite'); // TODO
	}

	removeTransitionEndListener() {
		if (this.transitionEndTimeout) {
			clearTimeout(this.transitionEndTimeout);
		}
		this.blockedByAnimations = false;
		this.sliderContent.setAttribute('aria-live', 'off');
	}

	handleKeydown(event) {
		switch (event.keyCode) {
			case keyCode.LEFT:
				this.goToPrevSlide();
				break;
			case keyCode.RIGHT:
				this.goToNextSlide();
				return;
			default:
				return;
		}
	}

	// Pagination

	initPagination() {
		this.createPaginationElements();
		this.dots = this.pagination.children;
	}

	createPaginationElements() {
		const tipsTotal = this.slidesTotal;
		const xmlns = "http://www.w3.org/2000/svg";
		this.pagination = document.createElementNS(xmlns, 'svg');
		this.pagination.setAttributeNS(null, 'class', 'dots');
		this.pagination.setAttributeNS(null, 'height', 25);
		this.pagination.setAttributeNS(null, 'width', (25 * tipsTotal));
		this.pagination.setAttributeNS(null, 'viewBox', `0 0 ${10 * tipsTotal} 5`);

		for (let i = 0; i < tipsTotal; i++) {
			const dot = document.createElementNS(xmlns, 'circle');
			dot.setAttributeNS(null, 'class', 'dot');
			dot.setAttributeNS(null, 'cx', ((10 * i) + 5));
			dot.setAttributeNS(null, 'cy', 2);
			dot.setAttributeNS(null, 'r', 2);
			dot.setAttributeNS(null, 'stroke-dasharray', 2 * Math.PI * 2);

			this.pagination.appendChild(dot);
		}

		this.paginationContent.appendChild(this.pagination);
	}

	destroyPagination() {
		this.paginationContent.innerHTML = '';
	}

	setActivePagination(index) {
		this.dots[this.currentSlideIndex].classList.remove('_current');
		this.dots[index].classList.add('_current');
	}

	startTipAnimation(duration) {
		this.dots[this.currentSlideIndex].style.animationDuration = (duration || 0) + 'ms';
		this.dots[this.currentSlideIndex].style.animationPlayState = 'running';
	}

	pauseTipAnimation() {
		this.dots[this.currentSlideIndex].style.animationPlayState = 'paused';
	}

	removeTipAnimation() {
		this.dots[this.currentSlideIndex].style.animationName = '';
	}

	// Destroy

	destroy() {
		this.removeEventListeners();
		this.destroyPagination();
	}
}
