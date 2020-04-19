/**
 * Library is used for work with Cookies
 */
export const cookie = {
	/**
     * setCookie
     * add cookie to the document
     * @param {string} cookieName - cookie name
     * @param {string} cookieValue - cookie value
     * @param {Number} expireInDays - number of days before cookie expiration. 0 - end of a session, 365 - default value
     */
	setCookie(cookieName, cookieValue, expireInDays = 365) {
		const d = new Date();
		d.setTime(d.getTime() + (expireInDays * 24 * 60 * 60 * 1000));
		const expires = expireInDays === 0 ? '' : `expires=${d.toUTCString()}`;
		document.cookie = `${cookieName}=${cookieValue};${expires};path=/`;
	},

	/**
     * getCookie
     * get cookie value from document
     * empty string is returned by default
     * @param {string} cookieName - cookie name
     * @returns {string} - cookie value
     */
	getCookie(cookieName) {
		const name = `${cookieName}=`;
		const ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return '';
	}
};
