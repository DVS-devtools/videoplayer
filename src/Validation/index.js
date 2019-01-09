/* eslint-disable func-names,valid-typeof,no-prototype-builtins */
const oneOfType = (value, typesArray) => typesArray.some(type => typeof value === type);

/**
 * @ignore
 * Validate an Object argument, must match the given schema
 * @param {Object} schema The schema to match es:
 * {field: 'string'} (typeof argument.field === 'string')
 * @param {number} [position] argument position, default 0 (first argument)
 * @param {Object} [aliases] field name alias
 * @example
 * ValidateObj({x: 'number', y: 'string'})
 * someMethod(obj) { // Stuff... }
 *
 * someMethod({x: 2, y: 'foo'}) // Ok
 * someMethod({y: 'foo'}) // Throw Error 'Invalid object passed at index 0 for method "someMethod",
 * // field "x" is required'
 * someMethod(x: 2, y: true}) // Throw Error Invalid object passed at index 0 for method
 // "someMethod", field "y" does not have the right type
 // Expecting: string
 // Received: boolean
 * @return {function(*, *, *): *}
 * @constructor
 */
export function ValidateObj(schema, position = 0, aliases = {}) {
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
                const alias = aliases[k];
                let i = k;
                if (!obj.hasOwnProperty(k)) {
                    if (alias) {
                        if (!obj.hasOwnProperty(alias)) {
                            throw new Error(`Invalid object passed at index ${position} for method "${key}", field "${k}" or "${alias}" is required`);
                        }
                        i = alias;
                    } else {
                        throw new Error(`Invalid object passed at index ${position} for method "${key}", field "${k}" is required`);
                    }
                }
                const types = schema[k].split('|');
                if (!oneOfType(obj[i], types)) {
                    throw new Error(`Invalid object passed at index ${position} for method "${key}", field "${i}" does not have the right type
    Expecting: ${schema[k]}
    Received: ${typeof obj[i]}`);
                }
            });
            return fn.call(this, ...args);
        };
        return descriptor;
    };
}

/**
 * @ignore
 * Validate method argument, can be chained for multiple arguments validation
 * @param {string} type typeof to match
 * @param {number} [position] argument position, default 0 (first argument)
 * @example
 * ValidateArg('string')
 * validateArg('boolean', 1)
 * someMethod(param1, param2) { // Stuff... }
 *
 * someMethod('foo', true) // Ok
 * someMethod('bar') // Throw Error 'Method "someMethod" is expecting 2 arguments, 1 passed'
 * someMethod(123, true) // Throw Error 'Invalid argument passed at index 0 for method "someMethod"
 * // Expecting: string Received: number'
 * @return {function(*, *, *): *}
 * @constructor
 */
export function ValidateArg(type, position = 0) {
    return function (target, key, descriptor) {
        const fn = descriptor.value;
        descriptor.value = function (...args) {
            if (args.length < fn.length) {
                throw new Error(`Expecting ${fn.length} argument${fn.length > 1 ? 's' : ''}, ${args.length} passed`);
            }
            if (typeof args[position] !== type) {
                throw new Error(`Invalid argument passed at index ${position}"
    Expecting: ${type}
    Received: ${typeof args[position]}`);
            }
            return fn.call(this, ...args);
        };
        return descriptor;
    };
}

export function ValidateOptionalArg(type, position = 0) {
    return function (target, key, descriptor) {
        const fn = descriptor.value;
        descriptor.value = function (...args) {
            if (args[position]) {
                if (typeof args[position] !== type) {
                    throw new Error(`Invalid argument passed at index ${position}"
    Expecting: ${type}
    Received: ${typeof args[position]}`);
                }
            }
            return fn.call(this, ...args);
        };
        return descriptor;
    };
}
