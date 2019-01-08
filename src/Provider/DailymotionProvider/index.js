import loadScript from 'load-script2';
import { getDomNode } from '../../lib';
import global from '../../global';

const sdkCdn = 'https://api.dmcdn.net/all.js';
global.DMSDK = null;

const eventsNameMapping = {
    end: 'video_end',
    playbackProgress: 'timeupdate',
    loadProgress: 'progress',
    seek: 'seeked',
    setVolume: 'volumechange',
    buffering: 'waiting',
};

/**
 * Dailymotion Player Wrapper
 * @ignore
 * @class DailymotionProvider
 */
class DailymotionProvider {
    id = null;

    domNodeId = null;

    dmPlayer = null;

    listeners = {};

    ready = null;

    timeupdatePercentages = {
        25: false,
        50: false,
        75: false,
    };

    get isMuted() {
        return this.dmPlayer ? this.dmPlayer.muted : undefined;
    }

    get isFullScreen() {
        return this.dmPlayer ? this.dmPlayer.fullscreen : undefined;
    }

    constructor(options, id) {
        this.id = id;

        this.ready = this.createDM(options.domNode,
            Object.assign({}, { video: options.videoId }, options.providerOptions || {}));
    }

    loadSDK() {
        if (!global.DMSDK) {
            if (typeof window.DM === 'object' && typeof window.DM.player === 'function') {
                global.DMSDK = Promise.resolve(window.DM);
            } else {
                global.DMSDK = new Promise((resolve, reject) => {
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
        return global.DMSDK;
    }

    createDM(domNode, options) {
        return new Promise((resolve, reject) => {
            this.loadSDK().then((DM) => {
                domNode = getDomNode(domNode);
                this.domNodeId = domNode.id;
                this.dmPlayer = DM.player(domNode, options);
                this.dmPlayer.addEventListener('apiready', () => resolve());
                this.registerDefaultListeners();
            }).catch(err => reject(err));
        });
    }

    fireEvent(evt) {
        if (typeof this.listeners[evt] !== 'undefined') {
            this.listeners[evt].forEach(event => event());
        }
    }

    onPercentage(percentage) {
        const { duration, currentTime } = this.dmPlayer;
        if (Math.floor((duration / 100) * percentage) === Math.floor(currentTime)) {
            if (!this.timeupdatePercentages[percentage]) {
                this.timeupdatePercentages[percentage] = true;
                this.fireEvent(`timeupdate${percentage}`);
            }
        } else {
            this.timeupdatePercentages[percentage] = false;
        }
    }

    registerDefaultListeners() {
        this.dmPlayer.addEventListener('timeupdate', () => {
            this.onPercentage(25);
            this.onPercentage(50);
            this.onPercentage(75);
        });
    }

    clear() {
        return this.ready.then(() => {
            document.getElementById(this.domNodeId).remove();
        });
    }

    on(event, cb) {
        return this.ready.then(() => {
            if (typeof this.listeners[event] === 'undefined') {
                this.listeners[event] = [];
            }
            this.listeners[event].unshift(cb);
            const eventName = eventsNameMapping[event] || Object.values(eventsNameMapping).find(e => e === 'event') || event;
            this.dmPlayer.addEventListener(eventName, cb);
        });
    }

    off(event, cb) {
        return this.ready.then(() => {
            if (this.listeners[event] && this.listeners[event].indexOf(cb) > -1) {
                const index = this.listeners[event].indexOf(cb);
                this.listeners[event].splice(index, 1);
            }
            this.dmPlayer.removeEventListener(event, cb);
        });
    }

    play() {
        return this.ready.then(() => this.dmPlayer.play());
    }

    pause() {
        return this.ready.then(() => this.dmPlayer.pause());
    }

    stop() {
        return this.ready.then(() => {
            this.dmPlayer.pause();
            this.dmPlayer.seek(0);
        });
    }

    mute() {
        return this.ready.then(() => this.dmPlayer.setMuted(true));
    }

    unmute() {
        return this.ready.then(() => this.dmPlayer.setMuted(false));
    }

    toggleMute() {
        return this.ready.then(() => this.dmPlayer.toggleMuted());
    }

    toggleFullScreen() {
        return this.ready.then(() => this.dmPlayer.setFullscreen(!this.dmPlayer.fullscreen));
    }

    setVolume(volumeLevel) {
        if (volumeLevel > 1) {
            volumeLevel /= 100;
        }
        return this.ready.then(() => this.dmPlayer.setVolume(volumeLevel));
    }

    forward(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime + seconds));
    }

    rewind(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime - seconds));
    }

    seek(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(seconds));
    }

    getListeners() {
        return this.listeners;
    }
}

export default DailymotionProvider;
