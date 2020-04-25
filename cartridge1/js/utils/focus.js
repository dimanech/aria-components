// If we need a blocking until find focusable element - make this as class with inner state.
// Please see full list https://allyjs.io/data-tables/focusable.html
// implementd only most common cases
export function isFocusable(element) {
	if (element.tabIndex > 0 || (element.tabIndex === 0 && element.hasAttribute('tabIndex')) || element.hasAttribute('contenteditable')) {
		return true;
	}

	if (element.disabled) {
		return false;
	}

	switch (element.nodeName) {
		case 'A':
			return !!element.href && element.rel !== 'ignore';
		case 'INPUT':
			return element.type !== 'hidden' && element.type !== 'file';
		case 'BUTTON':
		case 'SELECT':
		case 'TEXTAREA':
			return true;
		default:
			return false;
	}
}

export function attemptFocus(element) {
	if (!isFocusable(element)) {
		return false;
	}

	try {
		element.focus();
	} catch (e) {
		// catch error
	}

	return (document.activeElement === element);
}

export function focusFirstDescendant(element) {
	for (let i = 0; i < element.children.length; i++) {
		const child = element.children[i];
		if (attemptFocus(child) || focusFirstDescendant(child)) {
			return true;
		}
	}
	return false;
}

export function focusLastDescendant(element) {
	for (let i = element.children.length - 1; i >= 0; i--) {
		const child = element.children[i];
		if (attemptFocus(child) || focusLastDescendant(child)) {
			return true;
		}
	}
	return false;
}
