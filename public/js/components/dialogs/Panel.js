// JUST AN EXAMPLE!
import Dialog from './Dialog.js';

export default class Panel extends Dialog {
	constructor(dialogManager, dialogNode, focusAfterClose, focusAfterOpen) {
		super(dialogManager, dialogNode, focusAfterClose, focusAfterOpen);
		this.position = dialogNode.getAttribute('data-panel-position');
	}

	init() {
		super.init();
		this.addDragEventListeners();
		return true;
	}

	addDragEventListeners() {
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);

		this.backdropNode.addEventListener('mousedown', this.onTouchStart);
		this.backdropNode.addEventListener('touchstart', this.onTouchStart, { passive: true });
		this.backdropNode.addEventListener('mouseup', this.onTouchEnd);
		this.backdropNode.addEventListener('touchend', this.onTouchEnd, { passive: true });
		this.backdropNode.addEventListener('dragstart', this.onDragStart);
	}

	removeDragEventListeners() {
		this.backdropNode.removeEventListener('mousedown', this.onTouchStart);
		this.backdropNode.removeEventListener('touchstart', this.onTouchStart);
		this.backdropNode.removeEventListener('mouseup', this.onTouchEnd);
		this.backdropNode.removeEventListener('touchend', this.onTouchEnd);
		this.backdropNode.removeEventListener('dragstart', this.onDragStart);
	}

	onDragStart(event) {
		event.preventDefault();
	}

	onTouchMove(event) {
		const x = event.touches !== undefined ? event.touches[0].pageX : event.clientX;
		this.deltaX = ((this.initialX - x) / this.panelWidth) * 80;

		if (this.position === 'right' && this.deltaX < 0) {
			this.dialogNode.style.transform = 'translateX(' + (-this.deltaX) + '%)';
			document.documentElement.style.setProperty('--backdrop-opacity',  1 + (this.deltaX / 100));
		} else if (this.position === 'left' && this.deltaX > 0) {
			this.dialogNode.style.transform = 'translateX(' + (this.deltaX) + '%)';
			document.documentElement.style.setProperty('--backdrop-opacity',  1 - (this.deltaX / 100));
		}
	}

	onTouchStart(event) {
		this.initialX = event.pageX || event.touches[0].pageX;
		this.panelWidth = this.dialogNode.clientWidth;
		this.deltaX = 0;

		this.backdropNode.addEventListener('mousemove', this.onTouchMove);
		this.backdropNode.addEventListener('touchmove', this.onTouchMove);
		this.backdropNode.addEventListener('mouseleave', this.onTouchEnd);
		this.backdropNode.classList.add('m-grabbing');
	}

	onTouchEnd() {
		this.backdropNode.removeEventListener('mousemove', this.onTouchMove);
		this.backdropNode.removeEventListener('touchmove', this.onTouchMove);
		this.backdropNode.removeEventListener('mouseleave', this.onTouchEnd);
		this.backdropNode.classList.remove('m-grabbing');

		if ((this.deltaX <= -40) && this.position === 'right') {
			this.dialogManager.closeDialogFromOutside();
		} else if ((this.deltaX >= 40) && this.position === 'left') {
			this.dialogManager.closeDialogFromOutside();
		}

		setTimeout(() => document.documentElement.style.setProperty('--backdrop-opacity', 1), 400);
		this.dialogNode.style = null;
		this.deltaX = 0;
	}

	handleBackdropClick(event) {}

	destroy() {
		this.removeDragEventListeners();
		return super.destroy();
	}
}
