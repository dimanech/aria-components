/**
 * @param {string} url initial url
 * @param {string} name name of params
 * @param {string} value value of param
 */
export function appendParamToURL(url, name, value) {
	// quit if the param already exists
	if (url.includes(name + '=')) {
		return url;
	}
	const [urlWithoutHash, hash] = url.split('#');

	const separator = urlWithoutHash.includes('?') ? '&' : '?';
	return urlWithoutHash + separator + name + '=' + encodeURIComponent(value) + (hash ? '#' + hash : '');
}

/**
 * @param {string} url
 * @param {string} name
 */
export function removeParamFromURL(url, name) {
	if (url.includes('?') && url.includes(name + '=')) {
		var hash = '';
		var [domain, paramUrl] = url.split('?');
		// if there is a hash at the end, store the hash
		if (paramUrl.includes('#')) {
			[paramUrl, hash] = paramUrl.split('#');
		}
		/**
		 * @type {string[]}
		 */
		var newParams = [];
		paramUrl.split('&').forEach(param => {
			// put back param to newParams array if it is not the one to be removed
			if (param.split('=')[0] !== name) {
				newParams.push(param);
			}
		});

		return domain + (newParams.length ? '?' + newParams.join('&') : '') + (hash ? '#' + hash : '');
	}
	return url;
}


/**
 * @param {string} url initial url
 * @param {{[keys: string]: string}} params  parmas as key value-object
 */
export function appendParamsToUrl(url, params) {
	return Object.entries(params).reduce((acc, [name, value]) => {
		return appendParamToURL(acc, name, value);
	}, url);
}


/**
 * @param {string|undefined} [url] url
 */
export function getUrlParams(url) {
	// get query string from url (optional) or window
	var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

	// we'll store the parameters here
	/**
	 * @type {{[x: string]: string|number|boolean}}
	 */
	var obj = {};

	// if query string exists
	if (queryString) {
		// stuff after # is not part of query string, so get rid of it
		queryString = queryString.split('#')[0];

		// split our query string into its component parts
		var qsTokens = queryString.split('&');

		qsTokens.forEach(qsToken => {
			// separate the keys and the values
			var a = qsToken.split('=');

			// set parameter name and value (use 'true' if empty)
			var paramName = a[0];
			var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

			// if the paramName ends with square brackets, e.g. colors[] or colors[2]
			if (paramName.match(/\[(\d+)?\]$/)) {
				// create key if it doesn't exist
				var key = paramName.replace(/\[(\d+)?\]/, '');
				obj[key] = obj[key] || [];

				// if it's an indexed array e.g. colors[2]
				if (paramName.match(/\[\d+\]$/)) {
					// get the index value and add the entry at the appropriate position
					var index = /\[(\d+)\]/.exec(paramName)[1];
					obj[key][index] = paramValue;
				} else {
					// otherwise add the value to the end of the array
					obj[key].push(paramValue);
				}
			} else if (!obj[paramName]) {
				// if it doesn't exist, create property
				obj[paramName] = decodeURIComponent(paramValue);
			} else if (obj[paramName] && typeof obj[paramName] === 'string') {
				// if property does exist and it's a string, convert it to an array
				obj[paramName] = [obj[paramName]];
				obj[paramName].push(paramValue);
			} else {
				// otherwise add the property
				obj[paramName].push(paramValue);
			}
		});
	}

	return obj;
}
