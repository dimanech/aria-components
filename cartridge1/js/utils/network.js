import { appendParams } from './url.js';

let tokenName = '';
let tokenValue = '';

const defaultFetchOptions = {
	mode: 'same-origin',
	cache: 'default',
	credentials: 'same-origin',
	redirect: 'follow',
	referrer: 'no-referrer',
}

function fetchWithTimout(url, options, timeout = 7000) {
	return Promise.race([
		fetch(url, options),
		new Promise((_, reject) =>
			setTimeout(() => reject(new Error('timeout')), timeout)
		)
	]);
}

function showError(message) {
	document.body.dispatchEvent(new CustomEvent('notifier:notify', {
		bubbles: true,
		detail: { message: message }
	}));
}

/**
 * @param {string} method
 * @param {object} data
 * @param {boolean} skipToken
 * @param {string} url
 */
function handleUrlOrFormData(method, data, skipToken, url) {
	let formData;
	let valuedUrl;

	if (method === 'POST') {
		const token = tokenName && !skipToken ? { [tokenName]: tokenValue } : {};
		const dataToSend = { ...data, ...token };
		formData = Object.keys(dataToSend).map(key => key + '=' + encodeURIComponent(dataToSend[key])).join('&');

		valuedUrl = url;
	} else if (skipToken) {
		valuedUrl = appendParams(url, data);
	} else {
		valuedUrl = appendParams(url, { ...data, ...{ [tokenName]: tokenValue } });
	}

	return { valuedUrl, formData };
}

function handleResponse200(response, expected) {
	const contentType = response.headers.get('content-type');

	if (contentType && contentType.includes('application/json') && expected === 'JSON') {
		return response.json();
	}

	if (contentType && contentType.includes('text/html') && expected === 'HTML') {
		return response.text();
	}

	const message = `Response not in ${expected} format!`;
	document.body.dispatchEvent(new CustomEvent('notifier:notify', {
		bubbles: true,
		detail: { message: message }
	}));

	throw new TypeError(message);
}

function handleResponse500(response) {
	return response.text().then(textResponse => {
		let error = '';

		if (textResponse.includes('"csrfError": true')) {
			const errorMessage = JSON.parse(textResponse);
			if (errorMessage) {
				if (errorMessage.csrfError && errorMessage.redirectUrl) {
					window.location.assign(errorMessage.redirectUrl);
				} else {
					error = errorMessage;
				}
			}
		} else if (textResponse.includes('"errorMessage":')) {
			error = JSON.parse(textResponse).errorMessage;
		} else {
			const div = document.createElement('div');
			div.innerHTML = textResponse;
			error = Array.from(div.querySelectorAll('code')).map(code => code.innerHTML).join('\n');
		}

		showError(error);
		return Promise.reject(new Error(error));
	});
}

/**
 * @param {string} name tokenName
 * @param {string} val tokenValue
 */
export function setCurrentToken(name, val) {
	tokenName = name;
	tokenValue = val;
}

/**
 * @param {string} url url of resource
 * @param {object} data forms content
 * @param {'POST'|'GET'} [method] typeof request
 * @param {boolean} [skipToken] skip token for request
 * @param {number} [timeout] timeout for response
 */
export function submitFormJson(url, data = {}, method = 'POST', skipToken = false, timeout) {
	const { valuedUrl, formData } = handleUrlOrFormData(method, data, skipToken, url);
	const options = Object.assign({}, defaultFetchOptions, {
		method: method,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json'
		},
		body: formData
	});

	return fetchWithTimout(valuedUrl, options, timeout)
		.then(function (response) {
			if (response.ok) {
				return handleResponse200(response, 'JSON');
			} else if (response.status === 500) {
				return handleResponse500(response);
			}

			return response.json().then(errorJson => {
				return Promise.reject(errorJson);
			});
		}).catch(function (error) {
			return Promise.reject(error);
		});
}

/**
 * @param {string} url URL to get data
 * @param {object} [params] optional params to url
 * @param {number} [timeout] timeout for response
 */
export function getContentByUrl(url, params = {}, timeout) {
	const processedURL = appendParams(url, params);
	const options = Object.assign({}, defaultFetchOptions, {
		method: 'GET',
		headers: {
			Accept: 'text/html'
		},
	});

	return fetchWithTimout(processedURL, options, timeout)
		.then(function (response) {
			if (response.ok) {
				return handleResponse200(response, 'HTML');
			} else if (response.status === 500) {
				return handleResponse500(response);
			}

			return response.json().then(errorJson => {
				return Promise.reject(errorJson);
			});
		}).catch(function (error) {
			return Promise.reject(error);
		});
}

/**
 * @param {string} url URL to get data
 * @param {object} [params] optional params to url
 * @param {boolean} [skipToken] skip token
 * @param {number} [timeout] timeout for response
 */
export function getJSONByUrl(url, params = {}, skipToken = true, timeout) {
	return submitFormJson(url, params, 'GET', skipToken, timeout);
}
