/* eslint-disable func-names,valid-typeof,no-prototype-builtins */
const oneOfType = (value, typesArray) => typesArray.some(type => typeof value === type);

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
export function ValidateObj(schema, position = 0) {
    const keys = Object.keys(schema);
    return function (target, key, descriptor) {
        const fn = descriptor.value;
        descriptor.value = function (...args) {
            const obj = args[position];
            if (typeof obj !== 'object') {
                throw new Error(`Invalid argument passed at index ${position} for method "${key}"
    Expecting: object
    Received: ${typeof obj}`);
            }
            keys.forEach((k) => {
                if (!obj.hasOwnProperty(k)) {
                    throw new Error(`Invalid object passed at index ${position} for method "${key}", field "${k}" is required`);
                }
                const types = schema[k].split('|');
                if (!oneOfType(obj[k], types)) {
                    throw new Error(`Invalid object passed at index ${position} for method "${key}", field "${k}" does not have the right type
    Expecting: ${schema[k]}
    Received: ${typeof obj[k]}`);
                }
            });
            return fn.call(this, obj);
        };
        return descriptor;
    };
}

/**
 * @ignore
 * Validate method arguments
 * @example
 * ValidateArg(['string', 'boolean'])
 * someMethod(param1, param2) { // Stuff... }
 *
 * someMethod('foo', true) // Ok
 * someMethod('bar') // Throw Error 'Method "someMethod" is expecting 2 arguments, 1 passed'
 * someMethod(123, true) // Throw Error 'Invalid argument passed at index 0 for method "someMethod"
 * // Expecting: string Received: number'
 * @return {function(*, *=, *): *}
 * @constructor
 */
export function ValidateArg(type, position = 0) {
    return function (target, key, descriptor) {
        const fn = descriptor.value;
        descriptor.value = function (...args) {
            if (args.length < fn.length) {
                throw new Error(`Method "${key}" is expecting ${fn.length} argument${fn.length > 1 ? 's' : ''}, ${args.length} passed`);
            }
            if (typeof args[position] !== type) {
                throw new Error(`Invalid argument passed at index ${position} for method "${key}"
    Expecting: ${type}
    Received: ${typeof args[position]}`);
            }
            return fn.call(this, ...args);
        };
        return descriptor;
    };
}
