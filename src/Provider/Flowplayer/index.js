import loadscript from '../../lib/loadscript';
import loadstyle from '../../lib/loadstyle';
import global from '../../global';
import getDomNode from '../../lib/getDomNode';

/*
    ACCEPTED PROVIDER OPTIONS:
    - aspectRatio: string width to height,
    - autoplay: bool,
    - debug: bool,
    - fullscreen: bool,
    - muted: bool,
    - mutedAutoplay: bool,
    - poster: url to image (placeholder),
    - ratio: (integer),
    - speeds: (array),
    - seekStep: configure arrow key seek interval (bool or integer: s),
    - storage: localstorage, in case of abuse of memory disable it using {},
    - volume: (0 to 1),
    - key: For commercial use (string),
    - logo: (string or object)
*/

export default class FlowPlayer {
    id = null;

    videoUrl = null;

    domNodeId = null;

    videoId = null;

    listeners = {};

    ready = null;

    fpCSSUrl = 'https://releases.flowplayer.org/7.2.7/skin/skin.css';

    jqueryUrl = 'https://code.jquery.com/jquery-1.12.4.min.js';

    fpUrl = 'https://releases.flowplayer.org/7.2.7/flowplayer.min.js';

    fpPlayer = null;

    timeupdatePercentages = {
        25: false,
        50: false,
        75: false,
    };

    constructor(options, id) {
        this.id = id;
        this.videoId = options.videoId;

        if (typeof options.url !== 'undefined') {
            this.videoUrl = options.url;
        } else {
            // GENERATE URL
        }

        this.ready = this.createFP(options.domNode,
            Object.assign({}, {
                clip: {
                    videoId: options.videoId,
                    sources: [{
                        type: 'video/mp4',
                        src: this.videoUrl
                    }]
                }
            },
            options.providerOptions || {}));
    }

    loadSDK() {
        const jqueryPromise = new Promise((resolve, reject) => {
            loadscript(this.jqueryUrl, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const fpPromise = new Promise((resolve, reject) => {
            loadscript(this.fpUrl, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const fpCSSPromise = new Promise((resolve, reject) => {
            loadstyle(this.fpCSSUrl, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        if (!global.FPSDK) {
            if (typeof window.flowplayer === 'function') {
                global.FPSDK = Promise.resolve(window.flowplayer);
            } else {
                global.FPSDK = Promise.all([jqueryPromise, fpPromise, fpCSSPromise])
                    .then(() => window.flowplayer)
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }

        return global.FPSDK;
    }

    createFP(domNode, options) {
        return new Promise((resolve, reject) => {
            this.loadSDK().then((FP) => {
                const divElement = document.createElement('div');

                domNode = getDomNode(domNode);
                divElement.setAttribute('id', this.id);
                domNode.appendChild(divElement);

                this.domNodeId = divElement.id;

                // ADD options
                this.fpPlayer = FP(divElement, options);

                this.fpPlayer.on('ready', () => resolve());
                this.registerDefaultListeners();
            }).catch(err => reject(err));
        });
    }

    onPercentage(percentage) {
        const { duration, time } = this.fpPlayer.video;

        if (Math.floor((duration / 100) * percentage) === Math.floor(time)) {
            if (!this.timeupdatePercentages[percentage]) {
                this.timeupdatePercentages[percentage] = true;
                this.fireEvent(`playbackProgress${percentage}`);
            }
        } else {
            this.timeupdatePercentages[percentage] = false;
        }
    }

    registerDefaultListeners() {
        this.fpPlayer.on('progress', () => {
            this.onPercentage(25);
            this.onPercentage(50);
            this.onPercentage(75);
        });
    }
}