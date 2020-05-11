export function getSearchParamsParsed(url) {
	const u = new URL(url || window.location);
	return new URLSearchParams(u.search.slice(1));
}

/**
 * @param {string} url initial url
 * @param {string} name name of params
 * @param {string} value value of param
 */
export function appendParam(url, name, value) {
	const searchParams = getSearchParamsParsed(url);
	if (searchParams.has(name)) {
		return url;
	}
	return searchParams.append(name, value);
}

/**
 * @param {string} url initial url
 * @param {object} params params as key value-object
 */
export function appendParamMultiple(url, params) {
	let resultedURL = url;
	for (const param in params) {
		resultedURL = appendParam(resultedURL, param, params[param]);
	}
	return resultedURL;
}

/**
 * @param {string} url
 * @param {string} name
 */
export function deleteParam(url, name) {
	let searchParams = getSearchParamsParsed(url);
	searchParams.delete(name);

	return searchParams;
}

/**
 * TODO: could be buggy
 * @param {string|undefined} [url] url
 */
export function getUrlParams(url) {
	const searchParams = getSearchParamsParsed(url);
	let result = {};

	function keyedValuesToObject(paramName, value) {
		const arrayKeyRegExp = new RegExp(/\[\d+]/);
		const arrayKeyGroupRegExp = new RegExp(/\[(\d+)?]/);

		// create key if it doesn't exist
		const paramNameFromKeyedName = paramName.replace(arrayKeyGroupRegExp, '');
		result[paramNameFromKeyedName] = result[paramNameFromKeyedName] || [];

		// if it's an indexed array e.g. colors[2]
		if (paramName.match(arrayKeyRegExp)) {
			// get the index value and add the entry at the appropriate position
			const index = arrayKeyRegExp.exec(paramName)[1];
			result[paramNameFromKeyedName][index] = value;
		} else {
			// otherwise add the value to the end of the array
			result[paramNameFromKeyedName].push(value);
		}
	}

	for(let paramName of searchParams.keys()) {
		const arrayKeyGroupRegExp = new RegExp(/\[(\d+)?]/);
		const values = searchParams.getAll(paramName);

		if (paramName.match(arrayKeyGroupRegExp)) {
			keyedValuesToObject(paramName, values[0]);
		} else if (!result[paramName]) {
			if (values.length > 1) {
				result[paramName].push(...values);
			} else {
				result[paramName] = values[0];
			}
		}
	}

	return result;
}

/**
 * Get url #hash by key-value object
 * @param {string} [key] optional parameter - key id
 * @returns {object} key-value object or object[key] (if the parameter 'key' is passed to the function)
 */
export function getHash(key) {
	if (!document.location.hash) {
		return false;
	}

	const hash = document.location.hash
		.slice(1)
		.split('&')
		.reduce((obj, el) => {
			const [_key, _val] = el.split('=');
			obj[_key] = _val;
			return obj;
		}, {});

	return key ? hash[key] : hash;
}

/**
 * Set url #hash as key-value string
 * @param {string} key - query param key
 * @param {string} value - query param value
 * example: setHash('tab', 'best-sellers') -> #tab=best-sellers
 */
export function setHash(key, value) {
	let hesh = getHash() || {};
	hesh[key] = value;
	document.location.hash = Object.keys(hesh)
		.map(_key => `${encodeURIComponent(_key)}=${encodeURIComponent(hesh[_key])}`)
		.join('&');
}
