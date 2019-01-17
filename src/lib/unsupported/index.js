/* eslint-disable func-names */

export default (...fields) => function (target, key, descriptor) {
    if (descriptor) {
        const fn = descriptor.value;
        descriptor.value = function (...args) {
            console.warn(`Provider ${target.constructor.name} does not support the ${key} feature`);
            return fn.call(this, ...args);
        };
    } else {
        fields.forEach((field) => {
            target.prototype[field] = () => {
                console.warn(`Provider ${target.constructor.name} does not support the ${field} feature`);
            };
        });
    }
};
