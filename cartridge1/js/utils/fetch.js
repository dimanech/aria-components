import { appendParamsToUrl } from './url.js';

const SAME_ORIGIN = 'same-origin';
let tokenName = '';
let tokenValue = '';

/**
 * @param {string} name tokenName
 * @param {string} val tokenValue
 */
export function setCurrentToken(name, val) {
	tokenName = name;
	tokenValue = val;
}

function getFetch() {
	if (window.fetch) {
		return Promise.resolve(window.fetch);
	}
	return import(/* webpackChunkName: 'fetch-polyfill' */ '../libs/whatwg-fetch.js');
}

/**
 *
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
		valuedUrl = appendParamsToUrl(url, data);
	} else {
		valuedUrl = appendParamsToUrl(url, { ...data, ...{ [tokenName]: tokenValue } });
	}

	return { valuedUrl, formData };
}

function handleResponse500(response) {
	return response.text().then(textResponse => {
		if (textResponse.includes('"csrfError": true')) {
			const error = JSON.parse(textResponse);
			if (error) {
				if (error.csrfError && error.redirectUrl) {
					window.location.assign(error.redirectUrl);
				} else {
					document.body.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: error} }));
				}
			}
		} else if (textResponse.includes('"errorMessage":')) {
			return Promise.reject(new Error(JSON.parse(textResponse).errorMessage));
		} else {
			const div = document.createElement('div');
			div.innerHTML = textResponse;
			const err = Array.from(div.querySelectorAll('code')).map(code => code.innerHTML).join('\n');
			document.body.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: err} }));
		}
		return Promise.reject(new Error());
	});
}

/**
 * @param {string} url url of resource
 * @param {object} data forms content
 * @param {'POST'|'GET'} [method] typeof request
 * @param {boolean} [skipToken] skip token for request
 */
export const submitFormJson = (url, data = {}, method = 'POST', skipToken = false) => {
	return getFetch().then(() => {
		const { valuedUrl, formData } = handleUrlOrFormData(method, data, skipToken, url);

		/**
		 * This magic is mandatory for MS Edge because fetch polyfill is returning not polyfilled Promise object
		 */
		return Promise.resolve(fetch(valuedUrl, {
			method: method,
			mode: SAME_ORIGIN,
			cache: 'default',
			credentials: SAME_ORIGIN,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer',
			body: formData
		})).then((response) => {
			const contentType = response.headers.get('content-type');

			if (response.ok) {
				if (contentType && contentType.includes('application/json')) {
					return response.json();
				}
				const message = 'Oops, we haven\'t got JSON!';
				document.body.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: message} }));
				throw new TypeError(message);
			} else if (response.status === 500) {
				return handleResponse500(response);
			}

			return response.json().then(errorJson => {
				return Promise.reject(errorJson);
			});
		});
	});
};

/**
 *
 * @param {string} url URL to get data
 * @param {object} [params] optional params to url
 */
export function getContentByUrl(url, params = {}) {
	/**
	 * This magic is mandatory for MS Edge because fetch polyfill is returning not polyfilled Promise object
	 */
	return Promise.resolve(fetch(appendParamsToUrl(url, params), {
		method: 'GET',
		mode: SAME_ORIGIN,
		cache: 'default',
		credentials: SAME_ORIGIN,
		headers: {
			Accept: 'text/html'
		},
		redirect: 'follow',
		referrer: 'no-referrer'
	})).then((response) => {
		const contentType = response.headers.get('content-type');

		if (response.ok) {
			if (contentType && contentType.includes('text/html')) {
				return response.text();
			}
			const message = 'Oops, we haven\'t got text/html!';
			document.body.dispatchEvent(new CustomEvent('notifier:notify', { bubbles: true, detail: { message: message} }));
			throw new TypeError(message);
		} else if (response.status === 500) {
			return handleResponse500(response);
		}

		return response.json().then(errorJson => {
			return Promise.reject(errorJson);
		});
	});
}

/**
 * @param {string} url URL to get data
 * @param {object} [params] optional params to url
 * @param {boolean} [skipToken] skip token
 */
export function getJSONByUrl(url, params = {}, skipToken = true) {
	return submitFormJson(url, params, 'GET', skipToken);
}
