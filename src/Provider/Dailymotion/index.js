import { getDomNode, loadScript } from '../../lib';
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
    firstPlay: 'start',
};

const eventsToIgnore = [
    'playbackProgress25',
    'playbackProgress50',
    'playbackProgress75'
];

/**
 * Dailymotion Player Wrapper
 *
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
     * All registered internalListeners grouped by event:
     * {
     *     play: [
     *         {callback: fn(), once: false}
     *     ]
     * }
     * once flag: if true, the callback is fired once and then removed
     */
    internalListeners = {};

    /**
     * Internal event mapping to the DM Player events, grouped by event
     * the event callback will fire all registered event internalListeners of this.internalListeners
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
     * Return all the registered internalListeners grouped by their event
     *
     */
    get listeners() {
        return this.internalListeners;
    }

    /**
     * Get video Muted status
     *
     */
    get isMuted() {
        return this.ready.then(() => this.dmPlayer.muted);
    }

    /**
     * Get video Fullscreen status
     *
     */
    get isFullScreen() {
        return this.ready.then(() => this.dmPlayer.fullscreen);
    }

    /**
     *
     * @param options
     * @param id
     */
    constructor(options, id) {
        this.id = id;

        this.ready = this.createDM(options.domNode,
            Object.assign({}, { video: options.videoId }, options.providerOptions || {}));
    }

    /**
     * Load the DM SDK if not loaded yet
     * If multiple instances of this provider exists in the same page,
     * only one SDK is loaded and shared between all instances
     *
     * @return {Promise<any>}
     */
    loadSDK() {
        if (!global.DMSDK) {
            if (typeof window.DM === 'object' && typeof window.DM.player === 'function') {
                global.DMSDK = Promise.resolve(window.DM);
            } else {
                global.DMSDK = new Promise((resolve, reject) => {
                    loadScript(sdkCdn).then(() => resolve(window.DM))
                        .catch(err => reject(err));
                });
            }
        }
        return global.DMSDK;
    }

    /**
     * Create the DM Player in the given DOM Node with the given options
     * When the Player is ready, resolve the this.ready Promise
     *
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
                domNode.innerHTML = '';
                domNode.appendChild(iframe);

                this.domNodeId = iframe.id;
                this.dmPlayer = DM.player(iframe, options);
                this.dmPlayer.addEventListener('apiready', () => resolve());
                this.registerDefaultListeners();
            }).catch(err => reject(err));
        });
    }

    /**
     * Create a callback function that fires all registered internalListeners for a given event
     * Store the callback in the this.dmListeners object
     *
     * @param evt
     * @return {function(): void}
     */
    addDmListener(evt) {
        const callback = () => this.fireEvent(evt);
        this.dmListeners[evt] = callback;
        return callback;
    }

    /**
     * Fire all internalListeners for a given event
     * if a fired listener is flagged as once,
     * immediately deregister it after its fire (fired only once)
     *
     * @param evt
     */
    fireEvent(evt) {
        if (typeof this.internalListeners[evt] !== 'undefined') {
            this.internalListeners[evt].forEach((event) => {
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
     *
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
     * Register default internalListeners on Player init
     *
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
     *
     * @return {Promise<void>}
     */
    clear() {
        return this.ready.then(() => {
            document.getElementById(this.domNodeId).remove();
            this.dmListeners = {};
            this.internalListeners = {};
        });
    }

    /**
     * Add listener function to an event
     * Register the function in the internal this.internalListeners object
     * if there is no DM Player internalListeners for the requested event, register one
     * When the DM Player fires the event,
     * the registered callback will call all internalListeners associated with the event
     *
     * @param event
     * @param callback
     * @param once
     * @return {Promise<void>}
     */
    on(event, callback, once = false) {
        return this.ready.then(() => {
            const eventName = eventsNameMapping[event]
                || Object.values(eventsNameMapping).find(e => e === event)
                || event;
            if (typeof this.internalListeners[event] === 'undefined') {
                this.internalListeners[event] = [];
                if (!eventsToIgnore.includes(event)) {
                    this.dmPlayer.addEventListener(eventName, this.addDmListener(event));
                }
            }
            this.internalListeners[event].unshift({ callback, once });
        });
    }

    /**
     * Add a listener to an event,
     * the listener will be fired only once
     *
     * @param event
     * @param callback
     * @return {Promise<void>}
     */
    one(event, callback) {
        return this.on(event, callback, true);
    }

    /**
     * Remove a listener from an event
     * if the given listener is the last one for the given event
     * remove also the relative DM Player event listener
     *
     * @param event
     * @param callback
     * @return {Promise<void>}
     */
    off(event, callback) {
        return this.ready.then(() => {
            if (this.internalListeners[event]) {
                const index = this.internalListeners[event]
                    .findIndex(evt => evt.callback === callback);
                if (index > -1) {
                    this.internalListeners[event].splice(index, 1);
                }
                if (!this.internalListeners[event].length && this.dmListeners[event]) {
                    this.dmPlayer.removeEventListener(event, this.dmListeners[event]);
                }
            }
        });
    }

    /**
     * When DM Player is ready, send play command
     *
     * @return {Promise<any>}
     */
    play() {
        return this.ready.then(() => this.dmPlayer.play());
    }

    /**
     * When DM Player is ready, send pause command
     *
     * @return {Promise<any>}
     */
    pause() {
        return this.ready.then(() => this.dmPlayer.pause());
    }

    /**
     * When DM Player is ready, send pause and seek to 0 command
     * @return {Promise<any>}
     */
    stop() {
        return this.ready.then(() => {
            this.dmPlayer.pause();
            this.dmPlayer.seek(0);
        });
    }

    /**
     * When DM Player is ready, send command to mute
     * @return {Promise<any>}
     */
    mute() {
        return this.ready.then(() => this.dmPlayer.setMuted(true));
    }

    /**
     * When DM Player is ready, send command to unmute
     * @return {Promise<any>}
     */
    unmute() {
        return this.ready.then(() => this.dmPlayer.setMuted(false));
    }

    /**
     * When DM Player is ready, send command to toggle mute state
     * @return {Promise<any>}
     */
    toggleMute() {
        return this.ready.then(() => this.dmPlayer.toggleMuted());
    }

    togglePlay() {
        return this.ready.then(() => {
            if (this.dmPlayer.paused) {
                return this.play();
            }
            return this.pause();
        });
    }

    /**
     * When DM Player is ready, send command to toggle fullScreen state
     * @return {Promise<any>}
     */
    toggleFullScreen() {
        return this.ready.then(() => this.dmPlayer.setFullscreen(!this.dmPlayer.fullscreen));
    }

    /**
     * When DM Player is ready, send command to set volume
     * volumeLevel can be a float from 0 to 1 or an integer from 0 to 100
     * @param volumeLevel
     * @return {Promise<any>}
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
     * @return {Promise<any>}
     */
    forward(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime + seconds));
    }

    /**
     * When DM Player is ready, send command to seek to the current time minus the given seconds
     * @param seconds
     * @return {Promise<any>}
     */
    rewind(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(this.dmPlayer.currentTime - seconds));
    }

    /**
     * When DM Player is ready, send command to seek to the given seconds
     * @param seconds
     * @return {Promise<any>}
     */
    seek(seconds) {
        return this.ready.then(() => this.dmPlayer.seek(seconds));
    }

    /**
     * When DM Player is ready, send command to open the video on the Dailymotion website
     * @return {Promise<any>}
     */
    download() {
        return this.ready.then(() => this.dmPlayer.watchOnSite());
    }
}

export default DailymotionProvider;
