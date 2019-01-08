import loadScript from 'load-script2';
import { getDomNode, Unsupported } from '../../lib';

const sdkCdn = 'https://api.dmcdn.net/all.js';
let sdk = null;

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

    get isMuted() {
        return this.dmPlayer && this.dmPlayer.muted;
    }

    get isFullScreen() {
        return this.dmPlayer && this.dmPlayer.fullscreen;
    }

    constructor(options, id) {
        this.id = id;

        this.ready = this.createDM(options.domNode,
            Object.assign({}, { video: options.videoId }, options.providerOptions || {}));
    }

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

    createDM(domNode, options) {
        return new Promise((resolve, reject) => {
            this.loadSDK().then(() => {
                domNode = getDomNode(domNode);
                this.domNodeId = domNode.id;
                this.dmPlayer = window.DM.player(domNode, options);
                this.dmPlayer.addEventListener('apiready', () => resolve());
            }).catch(err => reject(err));
        });
    }

    clear() {
        document.getElementById(this.domNodeId).remove();
    }

    on(event, cb) {
        this.ready.then(() => {
            if (typeof this.listeners[event] === 'undefined') {
                this.listeners[event] = [];
            }
            this.listeners[event].unshift(cb);
            const eventName = eventsNameMapping[event] || Object.values(eventsNameMapping).find(e => e === 'event') || event;
            this.dmPlayer.addEventListener(eventName, cb);
        });
    }

    off(event, cb) {
        this.ready.then(() => {
            if (this.listeners[event] && this.listeners[event].indexOf(cb) > -1) {
                const index = this.listeners[event].indexOf(cb);
                this.listeners[event].splice(index, 1);
            }
            this.dmPlayer.removeEventListener(event, cb);
        });
    }

    play() {
        this.ready.then(() => this.dmPlayer.play());
    }

    pause() {
        this.ready.then(() => this.dmPlayer.pause());
    }

    stop() {
        this.ready.then(() => {
            this.dmPlayer.pause();
            this.dmPlayer.seek(0);
        });
    }

    mute() {
        this.ready.then(() => this.dmPlayer.setMuted(true));
    }

    unmute() {
        this.ready.then(() => this.dmPlayer.setMuted(false));
    }

    toggleMute() {
        this.ready.then(() => this.dmPlayer.toggleMuted());
    }

    toggleFullScreen() {
        this.ready.then(() => this.dmPlayer.setFullscreen(!this.dmPlayer.fullscreen));
    }

    setVolume(volumeLevel) {
        if (volumeLevel > 1) {
            volumeLevel /= 100;
        }
        this.ready.then(() => this.dmPlayer.setVolume(volumeLevel));
    }

    forward(seconds) {
        this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime + seconds));
    }

    rewind(seconds) {
        this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime - seconds));
    }

    seek(seconds) {
        this.ready.then(() => this.dmPlayer.seek(seconds));
    }

    getListeners() {
        return this.listeners;
    }
}

export default DailymotionProvider;
