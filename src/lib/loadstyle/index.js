export default (url, callback) => {
    if (typeof url === 'string') {
        const head = document.head || document.getElementsByTagName('head')[0];
        const link = document.createElement('link');

        link.href = url;
        link.rel = 'stylesheet';

        link.onload = () => {
            link.onerror = null;
            link.onload = null;

            callback(null, link);
        };

        link.onerror = () => {
            link.onerror = null;
            link.onload = null;

            callback(new Error(`Failed to load: ${url}`), link);
        };

        head.appendChild(link);
    }
};