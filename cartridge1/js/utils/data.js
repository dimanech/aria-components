/**
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
        const cache = memoizeInner.cache;
        const address = '' + (hasher ? hasher.apply(this, arguments) : key);
        if (typeof cache[address] === 'undefined') {
            cache[address] = func.apply(this, arguments);
        }
        return cache[address];
    }

    memoizeInner.cache = {};
    return memoizeInner;
}

/**
 * @param {any} target
 * @param {string} path
 * @param {any} [defaults]
 */
export function get(target, path, defaults) {
    let parts = (path + '').split('.');
    let part;

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
