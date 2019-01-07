import loadScript from 'load-script2';

const sdkCdn = 'https://api.dmcdn.net/all.js';
let sdk = null;

export class DailymotionProvider {
    id = null;

    dmPlayer = null;

    isMuted = false;

    isFullScreen = false;

    listeners = {};

    parent = null;

    loadSDK() {
        if (!sdk) {
            if (typeof window.DM === 'object' && typeof window.DM.player === 'function') {
                sdk = Promise.resolve(window.DM);
            } else {
                sdk = new Promise((resolve, reject) => {
                    loadScript(sdkCdn, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(window.DM);
                        }
                    });
                });
            }
        }
        return sdk;
    }

    getDomNode(domNode) {
        if (typeof domNode === 'string') {
            if (domNode.indexOf('#') === 0) {
                return document.querySelector(domNode);
            }
            return document.getElementById(domNode);
        }
        return domNode;
    }

    constructor(options, id) {
        this.id = id;


        console.log(options);
    }
}

export default DailymotionProvider;
