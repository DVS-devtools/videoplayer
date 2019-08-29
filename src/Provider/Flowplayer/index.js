import { loadScript, loadStyle, getDomNode } from '../../lib';
import global from '../../global';

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

/**
 * Flowplayer Player Wrapper
 * @ignore
 * @class FlowplayerProvider
 */
export default class FlowPlayerProvider {
    /**
     * Internal player id
     */
    id = null;

    /**
     * Video src url
     */
    videoUrl = null;

    /**
     * DOM Node id, where to mount the Flowplayer videplayer
     */
    domNodeId = null;

    /**
     *  The id of a video
     */
    videoId = null;

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
     * Internal event mapping to the flowplayer Player events, grouped by event
     * the event callback will fire all registered event internalListeners of this.internalListeners
     */
    fpListeners = {};

    /**
     * Promise resolved when the Flowplayer Player is ready to accept API calls
     */
    ready = null;

    /**
     * CSS url of flowplayer, can also be custom, must be implemented
     */
    fpCSSUrl = 'https://releases.flowplayer.org/7.2.7/skin/skin.css';

    /**
     * Flowplayer needs jquery, it's url is specified here
     */
    jqueryUrl = 'https://code.jquery.com/jquery-1.12.4.min.js';


    /**
     * Flowplayer JS url
     */
    fpUrl = 'https://releases.flowplayer.org/7.2.7/flowplayer.min.js';

    /**
     * Flowplayer JS Commercial Url
     */
    fpCommercialUrl = 'https://releases.flowplayer.org/7.2.7/commercial/flowplayer.min.js';

    /**
     * Flowplayer Audio plugin CSS
     */
    fpAudioCSSUrl = 'https://releases.flowplayer.org/audio/flowplayer.audio.css';

    /**
     * Flowplayer Audio plugin
     */
    fpAudioUrl = 'https://releases.flowplayer.org/audio/flowplayer.audio.min.js';

    /**
     * The Flowplayer Player instance
     */
    fpPlayer = null;

    /**
    * Flowplayer JS Commercial key
    */
    commercialKey = null;

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
    * Used for first play event
    */
    isPlayed = false;

    /**
     * Return all the registered internalListeners grouped by their event
     */
    get listeners() {
        return this.internalListeners;
    }

    /**
     * Get video muted status
     */
    get isMuted() {
        return this.ready.then(() => this.fpPlayer.muted);
    }

    /**
     * Get video fullscreen status
     */
    get isFullScreen() {
        return this.ready.then(() => this.fpPlayer.isFullscreen);
    }

    constructor(options, id) {
        this.id = id;
        this.videoId = options.videoId;

        if (typeof options.url !== 'undefined') {
            this.videoUrl = options.url;
        } else {
            // GENERATE URL
        }

        if (options.providerOptions && typeof options.providerOptions.key === 'string') {
            this.commercialKey = options.providerOptions.key;
        }

        this.ready = this.createFP(options.domNode, {
            clip: {
                videoId: options.videoId,
                sources: [{
                    type: options.mime || 'video/mp4',
                    src: this.videoUrl
                }]
            },
            ...(options.providerOptions || {}),
        });
    }

    /**
     * Load the Flowplayer SDK if not loaded yet
     * If multiple instances of this provider exists in the same page,
     * only one SDK is loaded and shared between all instances
     */
    loadSDK(loadAudio = false) {
        if (!global.FPSDK) {
            const jqueryPromise = loadScript(this.jqueryUrl);

            const fpPromise = loadScript(this.commercialKey ? this.fpCommercialUrl : this.fpUrl);

            const fpCSSPromise = loadStyle(this.fpCSSUrl);

            let audioPromise;
            let audioCssPromise;

            if (loadAudio) {
                audioPromise = loadScript(this.fpAudioUrl);
                audioCssPromise = loadStyle(this.fpAudioCSSUrl);
            } else {
                // eslint-disable-next-line no-multi-assign
                audioPromise = audioCssPromise = Promise.resolve();
            }

            if (typeof window.flowplayer === 'function') {
                global.FPSDK = Promise.resolve(window.flowplayer);
            } else {
                global.FPSDK = Promise.all([
                    jqueryPromise,
                    fpPromise,
                    fpCSSPromise,
                    audioPromise,
                    audioCssPromise,
                ])
                    .then(() => window.flowplayer)
                    .catch(err => {
                        throw err;
                    });
            }
        }

        return global.FPSDK;
    }

    /**
     * Create the Flowplayer Player in the given DOM Node with the given options
     * When the Player is ready, resolve the this.ready Promise
     * domNode: id of the container, or a domNode, or a query selector element
     * options: provider options of the player
     */
    createFP(domNode, options) {
        return new Promise((resolve, reject) => {
            this.loadSDK(options.audioOnly).then(FP => {
                if (typeof FP === 'function') {
                    domNode = getDomNode(domNode);
                    const divElement = document.createElement('div');
                    divElement.setAttribute('id', this.id);
                    domNode.innerHTML = '';
                    domNode.appendChild(divElement);

                    this.domNodeId = divElement.id;
                    this.fpPlayer = FP(divElement, options);
                    this.fpPlayer.on('ready', () => resolve());

                    this.registerDefaultListeners();
                } else {
                    throw new Error('Unable to load flowplayer');
                }
            }).catch(err => reject(err));
        });
    }

    /**
     * Create a callback function that fires all registered internalListeners for a given event
     * Store the callback in the this.fpListeners object
     */
    addFPListener(evt) {
        const callback = () => this.fireEvent(evt);
        this.fpListeners[evt] = callback;
        return callback;
    }

    /**
     * Fire all internalListeners for a given event
     * if a fired listener is flagged as once,
     * immediately deregister it after its fire (fired only once)
     */
    fireEvent(evt, params) {
        if (typeof this.internalListeners[evt] !== 'undefined') {
            this.internalListeners[evt].forEach(event => {
                if (typeof event.callback === 'function') {
                    event.callback(params);
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
     */
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

    /**
     * Fire the first play event (if played has not been started before)
     */
    fireFirstPlay = () => {
        if (!this.isPlayed) {
            this.fireEvent('firstPlay');
            this.isPlayed = true;

            this.off('resume', this.fireFirstPlay);
        }
    };

    /**
     * Register default internalListeners on Player init
     */
    registerDefaultListeners() {
        this.fpPlayer.on('progress', () => {
            this.onPercentage(25);
            this.onPercentage(50);
            this.onPercentage(75);
        });

        this.fpPlayer.on('resume', this.fireFirstPlay);
    }

    /**
     * Remove the Flowplayer Player DOM Node, and clear all the status and listeners
     */
    clear() {
        return this.ready.then(() => {
            if (document.getElementById(this.domNodeId)) {
                const elem = document.getElementById(this.domNodeId);

                if (elem) {
                    elem.remove();
                }

                this.fpListeners = {};
                this.internalListeners = {};

                if (this.fpPlayer) {
                    this.fpPlayer.stop();
                    this.fpPlayer.unload();
                    this.fpPlayer.shutdown();
                }
            } else {
                this.fpPlayer.on('resume', () => {
                    if (this.fpPlayer) {
                        this.fpPlayer.stop();
                        this.fpPlayer.unload();
                        this.fpPlayer.shutdown();
                    }

                    this.fpListeners = {};
                    this.internalListeners = {};
                });
            }
        });
    }

    /**
     * Add listener function to an event
     * Register the function in the internal this.internalListeners object
     * if there is no Flowplayer Player internalListeners for the requested event, register one
     * When the Flowplayer Player fires the event,
     * the registered callback will call all internalListeners associated with the event
     */
    on(event, callback, once = false) {
        return this.ready.then(() => {
            const eventName = eventsNameMapping[event] || Object.values(eventsNameMapping).find(e => e === 'event') || event;

            if (typeof this.internalListeners[event] === 'undefined') {
                this.internalListeners[event] = [];

                if (!eventsToIgnore.includes(event)) {
                    this.fpPlayer.on(eventName, this.addFPListener(event));
                }
            }

            this.internalListeners[event].unshift({ callback, once });
        });
    }

    /**
     * Add a listener to an event,
     * the listener will be fired only once
     */
    one(event, callback) {
        return this.on(event, callback, true);
    }

    /**
     * Remove a listener from an event
     * if the given listener is the last one for the given event
     * remove also the relative Flowplayer Player event listener
     */
    off(event, callback) {
        return this.ready.then(() => {
            if (this.internalListeners[event]) {
                const index = this.internalListeners[event]
                    .findIndex(evt => evt.callback === callback);
                if (index > -1) {
                    this.internalListeners[event].splice(index, 1);
                }
                if (!this.internalListeners[event].length && this.fpListeners[event]) {
                    this.fpPlayer.off(event, this.fpListeners[event]);
                }
            }
        });
    }

    /**
     * When Flowplayer Player is ready, send play command
     */
    play() {
        return this.ready.then(() => { this.fpPlayer.resume(); });
    }

    /**
     * When Flowplayer Player is ready, send pause command
     */
    pause() {
        return this.ready.then(() => { this.fpPlayer.pause(); });
    }

    /**
     * When Flowplayer Player is ready, send togglePlay command
     */
    togglePlay() {
        return this.ready.then(() => { this.fpPlayer.toggle(); });
    }

    /**
     * When Flowplayer Player is ready, send stop command
     */
    stop() {
        return this.ready.then(() => {
            this.fpPlayer.stop();
            this.isPlayed = false;
            this.fpPlayer.on('resume', this.fireFirstPlay);
        });
    }

    /**
     * When Flowplayer Player is ready, send mute command
     */
    mute() {
        return this.ready.then(() => { this.fpPlayer.mute(true); });
    }

    /**
     * When Flowplayer Player is ready, send unmute command
     */
    unmute() {
        return this.ready.then(() => { this.fpPlayer.mute(false); });
    }

    /**
     * When Flowplayer Player is ready, send togglemute command
     */
    toggleMute() {
        return this.ready.then(() => { this.fpPlayer.mute(); });
    }

    /**
     * When Flowplayer Player is ready, send togglefullscreen command
     */
    toggleFullScreen() {
        return this.ready.then(() => { this.fpPlayer.fullscreen(); });
    }

    /**
     * When Flowplayer Player is ready, set the volume to a given percentage
     */
    setVolume(volumeLevel) {
        if (volumeLevel > 1) {
            volumeLevel /= 100;
        }

        return this.ready.then(() => this.fpPlayer.volume(volumeLevel));
    }

    /**
     * When Flowplayer Player is ready, go forward from current time to given seconds
     */
    forward(seconds) {
        return this.ready.then(() => {
            this.fpPlayer.seek(this.fpPlayer.video.time + seconds);
        });
    }

    /**
     * When Flowplayer Player is ready, rewind from current time to given seconds
     */
    rewind(seconds) {
        return this.ready.then(() => {
            this.fpPlayer.seek(this.fpPlayer.video.time - seconds);
        });
    }

    /**
     * When Flowplayer Player is ready, set the current time to a specified time (in seconds)
     */
    seek(seconds) {
        return this.ready.then(() => { this.fpPlayer.seek(seconds); });
    }

    /**
     * start download flow
     */
    download() {
        // to implement;
    }
}
