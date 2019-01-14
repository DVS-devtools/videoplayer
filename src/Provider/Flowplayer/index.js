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

    for all the player options, please refer to https://flowplayer.com/help/developers/flowplayer-7/setup#player-options,
    for all the player events, please refer to: https://flowplayer.com/help/developers/flowplayer-7/api#events,
    for all the player commands, please refer to: https://flowplayer.com/help/developers/flowplayer-7/api
*/

const eventsNameMapping = {
    end: 'finish',
    playbackProgress: 'progress',
    loadProgress: 'buffer',
    setVolume: 'volume',
    play: 'resume',
};

const eventsToIgnore = [
    'playbackProgress25',
    'playbackProgress50',
    'playbackProgress75'
];

export default class FlowPlayer {
    id = null;

    videoUrl = null;

    domNodeId = null;

    videoId = null;

    internalListeners = {};

    fpListeners = {};

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

    isPlayed = false;

    get listeners() {
        return this.internalListeners;
    }

    get isMuted() { return this.fpPlayer.muted; } // TO UNDERSTAND - PROMISE

    get isFullScreen() { return this.fpPlayer.isFullscreen; } // TO UNDERSTAND - PROMISE

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
        if (!global.FPSDK) {
            const jqueryPromise = loadscript(this.jqueryUrl);

            const fpPromise = loadscript(this.fpUrl);

            const fpCSSPromise = loadstyle(this.fpCSSUrl);

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
                this.fpPlayer = FP(divElement, options);
                this.fpPlayer.on('ready', () => resolve());

                this.registerDefaultListeners();
            }).catch(err => reject(err));
        });
    }

    addFPListener(evt) {
        const cb = () => this.fireEvent(evt);
        this.fpListeners[evt] = cb;
        return cb;
    }

    fireEvent(evt, params) {
        if (typeof this.internalListeners[evt] !== 'undefined') {
            this.internalListeners[evt].forEach((event) => {
                if (typeof event.callback === 'function') {
                    event.callback(params);
                }
                if (event.once) {
                    this.off(evt, event.callback);
                }
            });
        }
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

    fireFirstPlay = () => {
        if (!this.isPlayed) {
            this.fireEvent('firstPlay');
            this.isPlayed = true;

            this.off('resume', this.fireFirstPlay);
        }
    };

    registerDefaultListeners() {
        this.fpPlayer.on('progress', () => {
            this.onPercentage(25);
            this.onPercentage(50);
            this.onPercentage(75);
        });

        this.fpPlayer.on('resume', this.fireFirstPlay);
    }

    clear() {
        return this.ready.then(() => {
            document.getElementById(this.domNodeId).remove();
            this.fpListeners = {};
            this.internalListeners = {};
        });
    }

    on(event, cb, once = false) {
        return this.ready.then(() => {
            const eventName = eventsNameMapping[event] || Object.values(eventsNameMapping).find(e => e === 'event') || event;

            if (typeof this.internalListeners[event] === 'undefined') {
                this.internalListeners[event] = [];

                if (!eventsToIgnore.includes(event)) {
                    this.fpPlayer.on(eventName, this.addFPListener(event));
                }
            }

            this.internalListeners[event].unshift({ callback: cb, once });
        });
    }

    one(event, cb) {
        return this.on(event, cb, true);
    }

    off(event, cb) {
        return this.ready.then(() => {
            if (this.internalListeners[event]) {
                const index = this.internalListeners[event].findIndex(evt => evt.callback === cb);
                if (index > -1) {
                    this.internalListeners[event].splice(index, 1);
                }
                if (!this.internalListeners[event].length && this.fpListeners[event]) {
                    this.fpPlayer.off(event, this.fpListeners[event]);
                }
            }
        });
    }

    play() {
        return this.ready.then(() => { this.fpPlayer.resume(); });
    }

    pause() {
        return this.ready.then(() => { this.fpPlayer.pause(); });
    }

    togglePlay() {
        return this.ready.then(() => { this.fpPlayer.toggle(); });
    }

    stop() {
        return this.ready.then(() => {
            this.fpPlayer.stop();
            this.isPlayed = false;
            this.fpPlayer.on('resume', this.fireFirstPlay);
        });
    }

    mute() {
        return this.ready.then(() => { this.fpPlayer.mute(true); });
    }

    unmute() {
        return this.ready.then(() => { this.fpPlayer.mute(false); });
    }

    toggleMute() {
        return this.ready.then(() => { this.fpPlayer.mute(); });
    }

    toggleFullScreen() {
        return this.ready.then(() => { this.fpPlayer.fullscreen(); });
    }

    setVolume(volumeLevel) {
        if (volumeLevel > 1) {
            volumeLevel /= 100;
        }

        return this.ready.then(() => this.fpPlayer.volume(volumeLevel));
    }

    forward(seconds) {
        return this.ready.then(() => {
            this.fpPlayer.seek(this.fpPlayer.video.time + seconds);
        });
    }

    rewind(seconds) {
        return this.ready.then(() => {
            this.fpPlayer.seek(this.fpPlayer.video.time - seconds);
        });
    }

    seek(seconds) {
        return this.ready.then(() => { this.fpPlayer.seek(seconds); });
    }

    download() {
        // to implement;
    }
}