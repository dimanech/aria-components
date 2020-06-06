// Not production ready
// TODO: add slide indexes

const keyCode = Object.freeze({
	LEFT: 37,
	RIGHT: 39,
});

export default class ContentSlider {
	/*
	 * ContentSlider
	 * Please see W3C specs https://www.w3.org/TR/wai-aria-practices/#carousel
	 */
	constructor(domNode) {
		// elements
		this.slider = domNode;
		this.sliderContent = this.slider.querySelector('[data-elem-content]')
		this.paginationContent = this.slider.querySelector('[data-elem-dots]')
		this.prevButton = this.slider.querySelector('[data-elem-prev-button]');
		this.nextButton = this.slider.querySelector('[data-elem-next-button]');
		// options
		this.stylesClass = {
			initialized: '_initialized',
			prev: '_prev',
			next: '_next',
			current: '_current',
			dots: 'dots',
			dot: 'dot',
			dotProgress: 'dot__progress',
			dotProgressBack: 'dot__progress-back'
		}
		// state
		this.currentSlideIndex = 0;
		this.slidesModel = [];
	}

	init() {
		this.initStructure();

		if (this.slidesTotal <= 1) {
			console.log('Only one slide is present. Slider not initialized');
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
		this.slider.classList.add(this.stylesClass.initialized);
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

		const newSlideIndex = this.normalizeIndex(index);
		this.slidesModel = this.getSlidesModel(newSlideIndex);

		this.toggleAnimationMode(true);
		this.waitForTransitionEnd(newSlideIndex, () => this.toggleAnimationMode(false));

		this.applySlidesModel();
		this.setActivePagination(newSlideIndex);
		this.currentSlideIndex = newSlideIndex;
	}

	toggleAnimationMode(isAnimated) {
		this.blockedByAnimations = isAnimated;
		this.sliderContent.setAttribute('aria-live', isAnimated ? 'polite' : 'off'); // TODO
	}

	applySlidesModel() {
		const allClasses = [this.stylesClass.prev, this.stylesClass.next, this.stylesClass.current];
		let n = this.slidesTotal;

		while (n--) {
			const slideElement = this.slides[n];
			const slideClass = this.slidesModel[n];

			slideElement.classList.remove(...allClasses);
			if (slideClass) {
				slideElement.classList.add(slideClass);
			}
		}
	}

	getSlidesModel(requestedIndex) {
		let model = new Array(this.slidesTotal);
		const nextIndex = this.normalizeIndex(requestedIndex + 1);
		const prevIndex = this.normalizeIndex(requestedIndex - 1);
		const currentIndex = this.normalizeIndex(requestedIndex);

		model.fill('');
		model[currentIndex] = this.stylesClass.current;
		model[nextIndex] = this.stylesClass.next;
		model[prevIndex] = this.stylesClass.prev;

		return model;
	}

	normalizeIndex(index) {
		if (index < 0) {
			return (this.slidesTotal - 1);
		} else {
			return index % this.slidesTotal;
		}
	}

	handleKeydown(event) {
		let preventEventActions = false;

		switch (event.keyCode) {
			case keyCode.LEFT:
				this.goToPrevSlide();
				preventEventActions = true;
				break;
			case keyCode.RIGHT:
				this.goToNextSlide();
				preventEventActions = true;
				return;
			default:
				return;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	waitForTransitionEnd(index, callback) {
		const onEnd = () => {
			clearTimeout(this.transitionFallbackTimer);
			callback();
		}
		this.transitionFallbackTimer = setTimeout(onEnd, 400);
	}

	//#region Pagination

	initPagination() {
		this.createPaginationElements();
		this.dots = this.pagination.children;
	}

	createPaginationElements() {
		const slidesTotal = this.slidesTotal;
		const xmlns = "http://www.w3.org/2000/svg";
		const progressSize = 8;
		const TAU = Math.PI * 2

		this.pagination = document.createElement('div');
		this.pagination.setAttribute('class', this.stylesClass.dots);

		for (let i = 0; i < slidesTotal; i++) {
			const dot = document.createElement('div');
			dot.setAttribute('class', this.stylesClass.dot);

			const svg = document.createElementNS(xmlns, 'svg');
			svg.setAttributeNS(null, 'height', 18);
			svg.setAttributeNS(null, 'width', 18);
			svg.setAttributeNS(null, 'viewBox', `0 0 ${progressSize} ${progressSize}`);

			const progressBack = document.createElementNS(xmlns, 'circle');
			progressBack.setAttributeNS(null, 'class', this.stylesClass.dotProgressBack);
			progressBack.setAttributeNS(null, 'cx', progressSize / 2);
			progressBack.setAttributeNS(null, 'cy', progressSize / 2);
			progressBack.setAttributeNS(null, 'r', 2);

			const progress = document.createElementNS(xmlns, 'circle');
			progress.setAttributeNS(null, 'class', this.stylesClass.dotProgress);
			progress.setAttributeNS(null, 'cx', progressSize / 2);
			progress.setAttributeNS(null, 'cy', progressSize / 2);
			progress.setAttributeNS(null, 'r', 2);
			progress.setAttributeNS(null, 'stroke-dasharray', TAU * 2);

			dot.appendChild(svg);
			svg.appendChild(progressBack);
			svg.appendChild(progress);
			this.pagination.appendChild(dot);
		}

		this.paginationContent.appendChild(this.pagination);
	}

	setActivePagination(index) {
		this.dots[this.currentSlideIndex].classList.remove(this.stylesClass.current);
		this.dots[index].classList.add(this.stylesClass.current);
	}

	startDotAnimation(duration) {
		this.dots[this.currentSlideIndex].style.animationDuration = `${duration || 0}ms`;
		this.dots[this.currentSlideIndex].style.animationPlayState = 'running';
	}

	pauseDotAnimation() {
		this.dots[this.currentSlideIndex].style.animationPlayState = 'paused';
	}

	removeDotAnimation() {
		this.dots[this.currentSlideIndex].style.animationName = '';
	}

	//#endregion

	// Destroy

	destroyPagination() {
		this.paginationContent.innerHTML = '';
	}

	destroy() {
		this.removeEventListeners();
		this.destroyPagination();
	}
}
