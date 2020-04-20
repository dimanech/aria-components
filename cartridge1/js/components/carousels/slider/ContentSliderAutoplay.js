import ContentSlider from './ContentSlider.js';

export default class ContentSliderAutoplay extends ContentSlider {
	constructor(domNode) {
		super(domNode);

		this.autoPlayEnabled = true;
		this.playButton = this.slider.querySelector('[data-elem-autoplay-toggle]');
		this.autoPlayDuration = 3000;
	}

	init() {
		super.init();

		if (!this.autoPlayEnabled) {
			console.log('No autoplay option. Autoplay not enabled.')
			return;
		}

		this.addAutoPlayEventListeners();
		this.startAutoPlay(true);
	}

	addEventListeners() {
		super.addEventListeners();

		this.startAutoPlay = this.startAutoPlay.bind(this);
		this.pauseAutoPlay = this.pauseAutoPlay.bind(this);
		this.toggleAutoPlay = this.toggleAutoPlay.bind(this);

		this.playButton.addEventListener('click', this.toggleAutoPlay);
	}

	addAutoPlayEventListeners() {
		this.slider.addEventListener('keyup', this.pauseAutoPlay);
		// TODO: focus out start play again
	}

	goToSlide(index) {
		super.goToSlide(index);

		this.startAutoPlay();
	}

	setActivePagination(index) {
		super.setActivePagination(index);
		if (!this.autoPlayPaused) {
			this.dots[index].classList.add('_autoplay');
		}
	}

	cycle() {
		this.stopAutoPlay();
		this.goToNextSlide();
		this.startAutoPlay();
	}

	toggleAutoPlay() {
		if (this.autoPlayPaused) {
			this.startAutoPlay(true);
		} else {
			this.pauseAutoPlay();
		}
	}

	startAutoPlay(isForce) {
		if (this.autoPlayPaused && !isForce) {
			return;
		}

		if (this.nextSlideTimer) {
			window.clearTimeout(this.nextSlideTimer);
		}

		this.autoPlayPaused = false;

		this.creationTime = Date.now();
		this.remainingTime = parseInt(this.autoPlayDuration);
		this.nextSlideTimer = window.setTimeout(this.cycle.bind(this), this.remainingTime);

		this.startTipAnimation(this.autoPlayDuration);
		this.toggleButtonState();

		this.slider.classList.add('_autoplay');
	}

	pauseAutoPlay() {
		if (this.nextSlideTimer) {
			window.clearTimeout(this.nextSlideTimer);
		}

		this.autoPlayPaused = true;

		this.remainingTime -= Date.now() - this.creationTime;

		this.pauseTipAnimation();
		this.toggleButtonState();

		this.slider.classList.remove('_autoplay');
	}

	stopAutoPlay() {
		if (this.nextSlideTimer) {
			window.clearTimeout(this.nextSlideTimer);
		}

		this.removeTipAnimation();

		this.slider.classList.remove('_autoplay');
	}

	toggleButtonState() {
		this.playButton.setAttribute('aria-pressed', this.autoPlayPaused);
	}

	disableAutoPlay() {
		this.stopAutoPlay();
		this.autoPlayEnabled = false;

		this.slider.removeEventListener('keyup', this.disableAutoPlay);
	}

	destroy() {
		super.destroy();

		this.playButton.removeEventListener('click', this.toggleAutoPlay);

		this.disableAutoPlay();
	}
}
