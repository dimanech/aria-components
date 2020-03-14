// JUST AN EXAMPLE!
import Dialog from './Dialog.js';

export default class Panel extends Dialog {
	constructor(dialogManager, dialogNode, focusAfterClose, focusAfterOpen, position) {
		super(dialogManager, dialogNode, focusAfterClose, focusAfterOpen);
		this.position = position;
	}

	init() {
		super.init();
	}

	addEventListeners() {
		this.addDragEventListeners();
		super.addEventListeners();
	}

	addDragEventListeners() {
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);

		this.dialogNode.addEventListener('mousedown', this.onTouchStart);
		this.dialogNode.addEventListener('touchstart', this.onTouchStart, { passive: true });
		this.dialogNode.addEventListener('mouseup', this.onTouchEnd);
		this.dialogNode.addEventListener('touchend', this.onTouchEnd, { passive: true });
		this.dialogNode.addEventListener('dragstart', this.onDragStart);
	}

	removeDragEventListeners() {
		this.dialogNode.removeEventListener('mousedown', this.onTouchStart);
		this.dialogNode.removeEventListener('touchstart', this.onTouchStart, { passive: true });
		this.dialogNode.removeEventListener('mouseup', this.onTouchEnd);
		this.dialogNode.removeEventListener('touchend', this.onTouchEnd, { passive: true });
		this.dialogNode.removeEventListener('dragstart', this.onDragStart);
	}

	onDragStart(event) {
		event.preventDefault();
	}

	onTouchMove(event) {
		const x = event.touches !== undefined ? event.touches[0].pageX : event.clientX;
		this.deltaX = (this.initialX - x) / this.windowWidth * 70;

		if (this.position === 'left' && this.deltaX < 0) {
			this.dialogNode.style.transform = 'translate3d(' + (-this.deltaX) + '%, 0, 0)';
		} else if (this.position === 'right' && this.deltaX > 0) {
			this.dialogNode.style.transform = 'translate3d(' + (this.deltaX) + '%, 0, 0)';
		}
	}

	onTouchStart(event) {
		this.initialX = event.pageX || event.touches[0].pageX;
		this.windowWidth = window.innerWidth;
		this.deltaX = 0;

		this.dialogNode.addEventListener('mousemove', this.onTouchMove);
		this.dialogNode.addEventListener('touchmove', this.onTouchMove);
		this.dialogNode.addEventListener('mouseleave', this.onTouchEnd);
		this.dialogNode.classList.add('m-grabbing');
	}

	onTouchEnd() {
		this.dialogNode.removeEventListener('mousemove', this.onTouchMove);
		this.dialogNode.removeEventListener('touchmove', this.onTouchMove);
		this.dialogNode.removeEventListener('mouseleave', this.onTouchEnd);
		this.dialogNode.classList.remove('m-grabbing');

		if ((this.deltaX <= -10) && this.position === 'left') {
			this.dialogManager.closeDialog();
		} else if ((this.deltaX >= 10) && this.position === 'right') {
			this.dialogManager.closeDialog();
		}

		this.dialogNode.style.transform = 'translate3d(0, 0, 0)';
		this.deltaX = 0;
	}

	destroy() {
		this.removeDragEventListeners();
		super.destroy();
	}
}
