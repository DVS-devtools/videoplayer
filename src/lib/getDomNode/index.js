export default (domNode) => {
    if (typeof domNode === 'string') {
        return document.querySelector(domNode);
        // if (domNode.indexOf('#') === 0) {
        //     return document.querySelector(domNode);
        // }
        // return document.getElementById(domNode);
    }
    return domNode;
};
