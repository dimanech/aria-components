export function append(domNode, str) {}

export function DOMReady(callback) {
	if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', callback);
	}
}
