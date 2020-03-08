// TO BE REVIEWED
/* eslint-disable no-param-reassign */
import { isTouchDevice } from 'widgets/toolbox/viewtype';

/* eslint-disable no-use-before-define */

export const log = window.console;

// IE11 fix
if (!log.table) {
    log.table = () => { };
}
/**
 * @param {string} message message with placeholders i.e. {0}
 * @param {...string} params values for placeholders
 * @returns {string}
 */
export function format(message, ...params) {
    return params.reduce((msg, param, idx) => {
        const reg = new RegExp('\\{' + idx + '\\}', 'gm');
        return msg.replace(reg, param);
    }, message);
}


/**
 * @param {Function} fn function to be called after specified time
 * @param {number} [time] time before call callback
 */
export function timeout(fn, time = 0) {
    var timer = setTimeout(() => {
        fn();
        timer = undefined;
        fn = undefined;
    }, time);

    return () => {
        if (timer) {
            clearTimeout(timer);
            timer = undefined;
            fn = undefined;
        }
    };
}

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
 *
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
 *
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

/**
 * @type {string[]}
 */
let errors = [];
/**
 *
 * @param {string|Error} message to show
 */
export function showErrorLayout(message) {
    const errorLayout = document.querySelector('#errorLayout');
    if (errorLayout) {
        if (message instanceof Error) {
            if (message.stack) {
                errors.unshift(message.stack);
            }
            errors.unshift(message.message);
        } else {
            errors.unshift(message);
        }

        log.error(message);
        errorLayout.addEventListener('click', () => {
            errorLayout.innerHTML = ''; errors = [];
        }, { once: true });

        errorLayout.innerHTML = `<div class="danger" style="
            bottom: 0;
            right: 0;
            position: fixed;
            background-color: #ff0000c7;
            border: black;
            padding: 5px;
            z-index: 9999999;
            border-radius: 10px;
        ">
                Error: <br/>
                ${errors.join('<hr/>')}
            </div>`;
    }
}

/**
 *
 * @param {Event} event DOM event
 * @param {HTMLElement} el element to track click on
 */
export function isEventTriggeredOutsideElement(event, el) {
    if (event.target && event.target instanceof Element) {
        let currElement = event.target;
        while (currElement.parentElement) {
            if (currElement === el) {
                return false;
            }
            currElement = currElement.parentElement;
        }
        return true;
    }
    return false;
}

function makeExposableListener(listener, eventName, eventNameTouch) {
    if (listener) {
        document.removeEventListener(eventName, listener);
        if (isTouchDevice()) {
            document.removeEventListener(eventNameTouch, listener);
        }
        listener = undefined;
    }
    return listener;
}

/**
 * @param {import('./RefElement').RefElement} el element to track click on
 * @param {*} cb callback
 * @param {boolean} [preventDefault] optional to prevent the default event
 */
export function clickOutside(el, cb, preventDefault = true) {
    // need for support desktop emulation
    const eventName = 'click';
    const eventNameTouch = 'touchend';
    const domEl = el.get();
    /**
     * @type {EventListener|undefined}
     */
    let listener;
    function expose() {
        listener = makeExposableListener(listener, eventName, eventNameTouch);
    }

    if (domEl) {
        listener = event => {
            if (isEventTriggeredOutsideElement(event, domEl)) {
                if (cb(event) === false) {
                    expose();
                }
                if (preventDefault === true) {
                    event.preventDefault();
                }
            }
        };
        setTimeout(() => {
            if (listener) {
                document.addEventListener(eventName, listener);
                if (isTouchDevice()) {
                    document.addEventListener(eventNameTouch, listener);
                }
            }
        }, 0);

        return expose;
    }
    throw new Error('Missing required el');
}


/**
 *
 * @param {any} x
 * @param {any} y
 * @returns {boolean}
 */
// eslint-disable-next-line complexity
export function objectEquals(x, y) {
    if (x === null || x === undefined || y === null || y === undefined) {
        return x === y;
    }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) {
        return false;
    }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) {
        return x === y;
    }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) {
        return x === y;
    }
    if (x === y || x.valueOf() === y.valueOf()) {
        return true;
    }
    if (Array.isArray(x) && x.length !== y.length) {
        return false;
    }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) {
        return false;
    }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) {
        return false;
    }
    if (!(y instanceof Object)) {
        return false;
    }

    // recursive object equality check
    var p = Object.keys(x);
    return Object.keys(y).every((i) => p.indexOf(i) !== -1)
        && p.every((i) => objectEquals(x[i], y[i]));
}

/**
 * Generate an integer Array containing an arithmetic progression
 *
 * @param {number} start start from
 * @param {number|null} [stop] end on
 * @param {number} [step] step
 */
export function range(start, stop, step) {
    if (stop === null) {
        stop = start || 0;
        start = 0;
    }
    if (!step) {
        step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var newRange = Array(length);

    for (var idx = 0; idx < length; idx += 1, start += step) {
        newRange[idx] = start;
    }

    return newRange;
}

const rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
/**
 * @param {string} data
 */
export function getData(data) {
    if (data === 'true') {
        return true;
    }

    if (data === 'false') {
        return false;
    }

    if (data === 'null') {
        return null;
    }

    // Only convert to a number if it doesn't change the string
    if (data === +data + '') {
        return +data;
    }

    if (rbrace.test(data)) {
        return JSON.parse(data);
    }

    return data;
}


export function memoize(func, hasher) {
    function memoizeInner(key) {
        var cache = memoizeInner.cache;
        var address = '' + (hasher ? hasher.apply(this, arguments) : key);
        if (typeof cache[address] === 'undefined') {
            cache[address] = func.apply(this, arguments);
        }
        return cache[address];
    }
    memoizeInner.cache = {};
    return memoizeInner;
}

/**
 * Add script tag on page
 *
 * @param {string} source url of script
 * @param {string} [globalObject]
 * @param {string?} [integrity]
 * @returns {Promise<any>}
 */
export const loadScript = memoize((source, globalObject, integrity) => {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        var prior = document.getElementsByTagName('script')[0];

        if (!prior || !prior.parentNode) {
            throw Error('No document');
        }

        script.async = true;

        if (integrity) {
            script.integrity = integrity;
        }
        script.type = 'text/javascript';
        prior.parentNode.insertBefore(script, prior);

        script.onload = (_, isAbort) => {
            if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = null;
                script.onreadystatechange = null;
                script = undefined;

                if (isAbort) {
                    reject();
                } else if (globalObject) {
                    if (window[globalObject]) {
                        resolve(window[globalObject]);
                    } else {
                        reject();
                    }
                } else {
                    resolve();
                }
            }
        };
        script.onabort = () => {
            reject();
        };
        script.onerror = () => {
            reject();
        };
        script.onreadystatechange = script.onload;
        script.src = source;
    });
});
/**
 * @param {any} target
 * @param {string} path
 * @param {any} [defaults]
 */
export function get(target, path, defaults) {
    let parts = (path + '').split('.'); let
        part;

    while (parts.length) {
        part = parts.shift();
        if (typeof target === 'object' && target !== null && part in target) {
            target = target[part];
        } else if (typeof target === 'string') {
            target = target[part];
            break;
        } else {
            target = defaults;
            break;
        }
    }
    return target;
}
