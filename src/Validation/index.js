/* eslint-disable func-names */
const findOne = (haystack, arr) => arr.some(v => haystack.includes(v));

/**
 * @ignore
 * Validate the existence of a key in an object
 * @example
 * ValidateObj('x', 'y')
 * someMethod(obj) { // Stuff... }
 *
 * someMethod({x: 2, y: 3}) // Ok
 * someMethod({y: 3}) // Throw Error '"x" is required for method "someMethod"'
 * Multiple keys (one of) validation
 * ValidateObj('x|y')
 * someMethod(obj) { // Stuff... }
 *
 * someMethod({x: 2}) // Ok
 * someMethod({y: 3}) // Ok
 * someMethod({z: 4}) // Throw Error 'Either "x" or "y" are required for method "someMethod"'
 * @param fields
 * @return {function(*, *=, *): *}
 * @constructor
 */
export function ValidateObj(...fields) {
    return function (target, key, descriptor) {
        const fn = descriptor.value;
        descriptor.value = function (obj) {
            const keys = Object.keys(obj);
            fields.forEach((fieldGroup) => {
                const splitted = fieldGroup.split('|');
                if (!findOne(keys, splitted)) {
                    const msg = splitted.length > 1 ? `Either "${splitted[0]}" or "${splitted[1]}" are required for method "${key}"` : `"${splitted[0]}" is required for method "${key}"`;
                    throw new Error(msg);
                }
            });
            return fn.call(this, obj);
        };
        return descriptor;
    };
}

/**
 * @ignore
 * Validate method arguments (check if they are not undefined)
 * @example
 * ValidateArg()
 * someMethod(param1, param2) { // Stuff... }
 *
 * someMethod('foo', true) // Ok
 * someMethod('bar') // Throw Error 'Argument "param2" is required for method "someMethod"'
 * @return {function(*, *=, *): *}
 * @constructor
 */
export function ValidateArg() { // TODO
    return function (target, key, descriptor) {
        const fn = descriptor.value;
        descriptor.value = function (...args) {
            if (args.length === 0) {
                throw new Error(`Argument is required for method "${key}"`);
            }
            args.forEach((arg) => {
                if (typeof arg === 'undefined') { // TODO check
                    throw new Error(`Argument is required for method "${key}"`);
                }
            });
            return fn.call(this, ...args);
        };
        return descriptor;
    };
}
