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
    firstStart: 'start',
};

const eventsToIgnore = [
    'playbackProgress25',
    'playbackProgress50',
    'playbackProgress75'
];

/**
 * Dailymotion Player Wrapper
 * @ignore
 * @class DailymotionProvider
 */
class DailymotionProvider {
    /**
     * Internal player id
     */
    id = null;

    /**
     * DOM Node id, where to mount the DM iframe
     */
    domNodeId = null;

    /**
     * The DM Player instance
     */
    dmPlayer = null;

    /**
     * All registered listeners grouped by event:
     * {
     *     play: [
     *         {callback: fn(), once: false}
     *     ]
     * }
     * once flag: if true, the callback is fired once and then removed
     */
    listeners = {};

    /**
     * Internal event mapping to the DM Player events, grouped by event
     * the event callback will fire all registered event listeners of this.listeners
     */
    dmListeners = {};

    /**
     * Promise resolved when the DM Player is ready to accept API calls
     */
    ready = null;

    /**
     * Keep track of playback progress percentage, used to fire playback percentage events
     * @type {{'25': boolean, '50': boolean, '75': boolean}}
     */
    timeupdatePercentages = {
        25: false,
        50: false,
        75: false,
    };

    /**
     * Get video Muted status
     */
    get isMuted() {
        return this.dmPlayer ? this.dmPlayer.muted : undefined;
    }

    /**
     * Get video Fullscreen status
     */
    get isFullScreen() {
        return this.dmPlayer ? this.dmPlayer.fullscreen : undefined;
    }

    constructor(options, id) {
        this.id = id;

        this.ready = this.createDM(options.domNode,
            Object.assign({}, { video: options.videoId }, options.providerOptions || {}));
    }

    /**
     * Load the DM SDK if not loaded yet
     * If multiple instances of this provider exists in the same page,
     * only one SDK is loaded and shared between all instances
     */
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

    /**
     * Create the DM Player in the given DOM Node with the given options
     * When the Player is ready, resolve the this.ready Promise
     * @param domNode
     * @param options
     * @return {Promise<any>}
     */
    createDM(domNode, options) {
        return new Promise((resolve, reject) => {
            this.loadSDK().then((DM) => {
                domNode = getDomNode(domNode);
                const iframe = document.createElement('iframe');
                iframe.setAttribute('id', this.id);
                domNode.appendChild(iframe);
                this.domNodeId = iframe.id;
                this.dmPlayer = DM.player(iframe, options);
                this.dmPlayer.addEventListener('apiready', () => resolve());
                this.registerDefaultListeners();
            }).catch(err => reject(err));
        });
    }

    /**
     * Create a callback function that fires all registered listeners for a given event
     * Store the callback in the this.dmListeners object
     * @param evt
     * @return {function(): void}
     */
    addDmListener(evt) {
        const cb = () => this.fireEvent(evt);
        this.dmListeners[evt] = cb;
        return cb;
    }

    /**
     * Fire all listeners for a given event
     * if a fired listener is flagged as once,
     * immediately deregister it after its fire (fired only once)
     * @param evt
     */
    fireEvent(evt) {
        if (typeof this.listeners[evt] !== 'undefined') {
            this.listeners[evt].forEach((event) => {
                if (typeof event.callback === 'function') {
                    event.callback();
                }
                if (event.once) {
                    this.off(evt, event.callback);
                }
            });
        }
    }

    /**
     * Given a percentage (one of the this.timeupdatePercentages keys)
     * check if the video playback reached that percentage of completion,
     * if yes, fire the playbackProgress% event
     * @param percentage
     */
    onPercentage(percentage) {
        const { duration, currentTime } = this.dmPlayer;
        if (Math.floor((duration / 100) * percentage) === Math.floor(currentTime)) {
            if (!this.timeupdatePercentages[percentage]) {
                this.timeupdatePercentages[percentage] = true;
                this.fireEvent(`playbackProgress${percentage}`);
            }
        } else {
            this.timeupdatePercentages[percentage] = false;
        }
    }

    /**
     * Register default listeners on Player init
     */
    registerDefaultListeners() {
        this.dmPlayer.addEventListener('timeupdate', () => {
            this.onPercentage(25);
            this.onPercentage(50);
            this.onPercentage(75);
        });
    }

    /**
     * Remove the DM Player DOM Node
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    clear() {
        return this.ready.then(() => {
            document.getElementById(this.domNodeId).remove();
            this.dmListeners = {};
            this.listeners = {};
        });
    }

    /**
     * Add listener function to an event
     * Register the function in the internal this.listeners object
     * if there is no DM Player listeners for the requested event, register one
     * When the DM Player fires the event,
     * the registered cb will call all listeners associated with the event
     * @param event
     * @param cb
     * @param once
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    on(event, cb, once = false) {
        return this.ready.then(() => {
            const eventName = eventsNameMapping[event]
                || Object.values(eventsNameMapping).find(e => e === event)
                || event;
            if (typeof this.listeners[event] === 'undefined') {
                this.listeners[event] = [];
                if (!eventsToIgnore.includes(event)) {
                    this.dmPlayer.addEventListener(eventName, this.addDmListener(event));
                }
            }
            this.listeners[event].unshift({ callback: cb, once });
        });
    }

    /**
     * Add a listener to an event,
     * the listener will be fired only once
     * @param event
     * @param cb
     * @return {PromiseLike<T|never>|Promise<T|never>}
     */
    one(event, cb) {
        return this.on(event, cb, true);
    }

    /**
     * Remove a listener from an event
     * if the given listener is the last one for the given event
     * remove also the relative DM Player event listener
     * @param event
     * @param cb
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    off(event, cb) {
        return this.ready.then(() => {
            if (this.listeners[event]) {
                const index = this.listeners[event].findIndex(evt => evt.callback === cb);
                if (index > -1) {
                    this.listeners[event].splice(index, 1);
                }
                if (!this.listeners[event].length && this.dmListeners[event]) {
                    this.dmPlayer.removeEventListener(event, this.dmListeners[event]);
                }
            }
        });
    }

    /**
     * When DM Player is ready, send play command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    play() {
        return this.ready.then(() => this.dmPlayer.play());
    }

    /**
     * When DM Player is ready, send pause command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    pause() {
        return this.ready.then(() => this.dmPlayer.pause());
    }

    /**
     * When DM Player is ready, send pause and seek to 0 command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    stop() {
        return this.ready.then(() => {
            this.dmPlayer.pause();
            this.dmPlayer.seek(0);
        });
    }

    /**
     * When DM Player is ready, send command to mute
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    mute() {
        return this.ready.then(() => this.dmPlayer.setMuted(true));
    }

    /**
     * When DM Player is ready, send command to unmute
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    unmute() {
        return this.ready.then(() => this.dmPlayer.setMuted(false));
    }

    /**
     * When DM Player is ready, send command to toggle mute state
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    toggleMute() {
        return this.ready.then(() => this.dmPlayer.toggleMuted());
    }

    /**
     * When DM Player is ready, send command to toggle fullScreen state
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    toggleFullScreen() {
        return this.ready.then(() => this.dmPlayer.setFullscreen(!this.dmPlayer.fullscreen));
    }

    /**
     * When DM Player is ready, send command to set volume
     * volumeLevel can be a float from 0 to 1 or an integer from 0 to 100
     * @param volumeLevel
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    setVolume(volumeLevel) {
        if (volumeLevel > 1) {
            volumeLevel /= 100;
        }
        return this.ready.then(() => this.dmPlayer.setVolume(volumeLevel));
    }

    /**
     * When DM Player is ready, send command to seek to the current time plus the given seconds
     * @param seconds
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    forward(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime + seconds));
    }

    /**
     * When DM Player is ready, send command to seek to the current time minus the given seconds
     * @param seconds
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    rewind(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime - seconds));
    }

    /**
     * When DM Player is ready, send command to seek to the given seconds
     * @param seconds
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    seek(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(seconds));
    }

    /**
     * When DM Player is ready, send command to open the video on the Dailymotion website
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    download() {
        return this.ready.then(() => this.dmPlayer.watchOnSite());
    }

    /**
     * Return all the registered listeners grouped by their event
     */
    getListeners() {
        return this.listeners;
    }
}

export default DailymotionProvider;
