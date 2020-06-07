import ContentSlider from './ContentSlider.js';

// TODO: pause on hover?
// TODO: disable autoplay if duration is 0 or not provided

export default class ContentSliderAutoplay extends ContentSlider {
	constructor(domNode) {
		super(domNode);

		this.autoPlayEnabled = this.slider.hasAttribute('data-autoplay');
		this.playButton = this.slider.querySelector('[data-elem-autoplay-toggle]');
		this.autoPlayDuration = this.slider.getAttribute('data-autoplay') || 3000;

		this.remainingTime = undefined;

		this.stylesClass.autoplay = '_autoplay';
		this.stylesClass.paused = '_paused';
	}

	init() {
		super.init();

		if (!this.autoPlayEnabled) {
			return;
		}

		this.start(true);
	}

	addEventListeners() {
		super.addEventListeners();

		this.togglePlay = this.togglePlay.bind(this);
		this.pause = this.pause.bind(this);

		this.playButton.addEventListener('click', this.togglePlay);
		this.sliderContent.addEventListener('focusin', this.pause);
	}

	goToSlide(index) {
		this.end();
		super.goToSlide(index);
		this.start();
	}

	setActivePagination(index) {
		super.setActivePagination(index);

		if (!this.autoPlayPaused) {
			this.dots[index].classList.add(this.stylesClass.autoplay);
		}
	}

	cycle() {
		this.end();
		this.goToNextSlide();
		this.start();
	}

	togglePlay(event) {
		event.stopPropagation();

		if (this.autoPlayPaused) {
			this.start(true);
		} else {
			this.pause();
		}
	}

	start(isForce) {
		if (this.autoPlayPaused && !isForce) {
			return;
		}

		if (this.nextSlideTimer) {
			window.clearTimeout(this.nextSlideTimer);
		}
		this.autoPlayPaused = false;
		this.slider.classList.remove(this.stylesClass.paused);

		this.creationTime = Date.now();
		if (this.remainingTime === undefined || isForce) {
			this.remainingTime = parseInt(this.autoPlayDuration, 10); // force to access by value
		}
		this.nextSlideTimer = window.setTimeout(this.cycle.bind(this), this.remainingTime);

		this.startDotAnimation(this.remainingTime);
		this.togglePlayButtonState();
		this.slider.classList.add(this.stylesClass.autoplay);
	}

	pause() {
		if (this.nextSlideTimer) {
			window.clearTimeout(this.nextSlideTimer);
		}
		this.autoPlayPaused = true;
		this.slider.classList.add(this.stylesClass.paused);

		this.remainingTime -= (Date.now() - this.creationTime);

		this.pauseDotAnimation();
		this.togglePlayButtonState();
		this.slider.classList.remove(this.stylesClass.autoplay);
	}

	end() {
		if (this.nextSlideTimer) {
			window.clearTimeout(this.nextSlideTimer);
		}
		this.slider.classList.remove(this.stylesClass.paused);

		this.remainingTime = undefined;

		this.removeDotAnimation();
		this.slider.classList.remove(this.stylesClass.autoplay);
	}

	togglePlayButtonState() {
		this.playButton.setAttribute('aria-pressed', this.autoPlayPaused);
	}

	// destroy

	removeEventListeners() {
		super.removeEventListeners();
		this.playButton.removeEventListener('click', this.togglePlay);
		this.sliderContent.removeEventListener('focusin', this.pause);
	}

	disableAutoPlay() {
		this.end();
		this.autoPlayEnabled = false;
	}

	destroy() {
		super.destroy();
		this.disableAutoPlay();
	}
}
