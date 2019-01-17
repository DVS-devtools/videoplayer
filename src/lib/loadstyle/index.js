export default url => new Promise((resolve, reject) => {
    if (typeof url === 'string') {
        const head = document.head || document.getElementsByTagName('head')[0];
        const link = document.createElement('link');

        link.href = url;
        link.rel = 'stylesheet';

        link.onload = () => {
            link.onerror = null;
            link.onload = null;

            resolve(null, link);
        };

        link.onerror = () => {
            link.onerror = null;
            link.onload = null;

            reject(new Error(`Failed to load: ${url}`), link);
        };

        head.appendChild(link);
    }
});