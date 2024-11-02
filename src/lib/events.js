import { isDefined } from "./helpers.js";

/**
 * @template V, R
 * @typedef {(k: V) => R} Fn
 */

/**
 * @template T
 * @typedef {Object} Events<T>
 * @type {T extends Array ? never : T extends Object ? {
 *      [K in keyof T as `${K & string}`]: T[K] } & {
 *      [K in keyof T as `${K & string}$on`]: (condition: Fn<T[K], boolean>, func: Fn<T[K], void>, options?: { once?: boolean }) => Fn<T[K], void> } & {
 *      [K in keyof T as `${K & string}$onChange`]: Fn<Fn<T[K], void>, void> } & {
 *      [K in keyof T as `${K & string}$subscription`]: () => (condition: Fn<T[K], boolean>, func: Fn<T[K], void>, options?: { once?: boolean }) => Fn<T[K], void>
 * } : K in T}
 */

/**
 * @template T
 * @param {T} obj
 * @returns {Events<T>}
 */
export function events(obj) {
    let result = {};
    
    function formCondition(condition) {
        if (!isDefined(condition)) throw new Error("Invalid condition");
        switch (typeof condition) {
            case "function":
                return condition;
            case "object":
                const cond_keys = Object.keys(condition);
                if (cond_keys.some((key) => !isDefined(v[key]))) {
                    throw new Error(`Invalid condition: unknown key ${key}`);
                }

                return (val) =>
                    cond_keys.every((key) => condition[key] === val[key]);
            default:
                return (val) => condition === val;
        }
    }

    for (let [k, v] of Object.entries(obj)) {
        let events = [];
        Object.defineProperties(result, {
            [k]: {
                configurable: false,
                enumerable: false,
                get: function () {
                    return v;
                },
                set: function (val) {
                    v = val;
                    events = events.filter(([condition, func, options], id) => {
                        if (!condition(val)) return true;
                        func(result[k]);
                        return !options.once;
                    });
                },
            },
            [k + "$on"]: {
                configurable: false,
                enumerable: false,
                value: function (condition, func, options = { once: false }) {
                    events.push([formCondition(condition), func, options]);
                    return condition;
                },
            },
            [k + "$onChange"]: {
                configurable: false,
                enumerable: false,
                value: function (func) {
                    events.push([() => true, func, { once: false }]);
                },
            },
            [k + "$subscription"]: {
                configurable: false,
                enumerable: false,
                value: function () {
                    return result[k + "$on"];
                },
            },
        });
    }

    return result;
}

let foo = events({
    begin: false,
    index: false,
    doctype: false,
    configyml: false,
    infshop: false,
});

let bar = events(0);
