export default (url, callback) => {
    if (typeof url === 'string') {
        const head = document.head || document.getElementsByTagName('head')[0];
        const script = document.createElement('script');

        script.src = url;
        script.async = true;
        script.type = 'text/javascript';

        script.onload = () => {
            script.onerror = null;
            script.onload = null;

            callback(null, script);
        };

        script.onerror = () => {
            script.onerror = null;
            script.onload = null;

            callback(new Error(`Failed to load: ${url}`), script);
        };

        head.appendChild(script);
    }
};