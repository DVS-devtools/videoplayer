/* eslint-disable func-names */

export function getDomNode(domNode) {
    if (typeof domNode === 'string') {
        if (domNode.indexOf('#') === 0) {
            return document.querySelector(domNode);
        }
        return document.getElementById(domNode);
    }
    return domNode;
}


export function Unsupported(...fields) {
    return function (target, key, descriptor) {
        if (descriptor) {
            descriptor.value = () => {
                console.warn(`Provider ${target.constructor.name} does not support the ${key} feature`);
            };
        } else {
            fields.forEach((field) => {
                target.prototype[field] = () => {
                    console.warn(`Provider ${target.constructor.name} does not support the ${field} feature`);
                };
            });
        }
    };
}
