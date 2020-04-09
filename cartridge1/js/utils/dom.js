export function append(domNode, str) {}

export function siblings(domNode) {

}

export function closest(element, CSSclass) {
	while (element && element !== document) {
		if (element.classList.contains(CSSclass)) {
			return element;
		}

		element = element.parentNode;
	}

	return null;
}

export function DOMReady(callback) {
	if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', callback);
	}
}
