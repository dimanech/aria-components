//export function append(domNode, str) {}
//
//export function siblings(domNode) {
//
//}

export function closest(element, attributeString) {
	while (element && element !== document) {
		if (element.hasAttribute(attributeString)) {
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
