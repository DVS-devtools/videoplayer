const checkAlreadyLoaded = url => {
    const scripts = document.getElementsByTagName('script');
    // eslint-disable-next-line no-plusplus
    for (let i = scripts.length; i--;) {
        if (scripts[i].src === url) {
            return scripts[i];
        }
    }
    return false;
};

export default url => new Promise((resolve, reject) => {
    if (typeof url === 'string') {
        const alreadyLoaded = checkAlreadyLoaded(url);
        if (alreadyLoaded) {
            resolve(null, alreadyLoaded);
        } else {
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
    }
});
