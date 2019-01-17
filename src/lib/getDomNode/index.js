export default (domNode) => {
    if (typeof domNode === 'string') {
        if (domNode.indexOf('#') === 0) {
            return document.querySelector(domNode);
        }
        return document.getElementById(domNode);
    }
    return domNode;
};
