export default url => new Promise((resolve, reject) => {
    if (typeof url === 'string') {
        const head = document.head || document.getElementsByTagName('head')[0];
        const script = document.createElement('script');

        script.src = url;
        script.async = true;
        script.type = 'text/javascript';

        script.onload = () => {
            script.onerror = null;
            script.onload = null;

            resolve(null, script);
        };

        script.onerror = () => {
            script.onerror = null;
            script.onload = null;

            reject(new Error(`Failed to load: ${url}`), script);
        };

        head.appendChild(script);
    }
});