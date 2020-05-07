// we use document as entry point for events bus. So use direct listeners is the same
// as use this wrapper

export default class EventBus {
	constructor() {}

	on(type, handler) {
		document.addEventListener(type, handler);
	}

	off(type, handler) {
		document.addEventListener(type, handler);
	}

	emit(type, data) {
		document.dispatchEvent(new CustomEvent(type, { detail: data }));
	}
}
