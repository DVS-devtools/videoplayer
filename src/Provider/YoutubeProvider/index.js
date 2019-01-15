import getDomNode from '../../lib/getDomNode';
import Unsupported from '../../lib/unsupported';
import global from '../../global';

const eventsNameMapping = {
    0: 'end',
    1: 'play',
    2: 'pause',
    3: 'buffering',
};

/**
 * Youtube Player Wrapper
 * @ignore
 * @class YoutubeProvider
 */
@Unsupported('toggleFullScreen')
class YoutubeProvider {
    /**
     * Internal player id
     */
    id = null;

    /**
     * The Youtube Player instance
     */
    ytPlayer = null;

    /**
     * All registered listeners grouped by event:
     * {
     *     play: [
     *         {callback: fn(), once: false}
     *     ]
     * }
     * once flag: if true, the callback is fired once and then removed
     */
    internalListeners = {};

    /**
     * Promise resolved when the Youtube library is loaded and the Youtube Player is ready
     */
    ready = null;

    /**
     * setInterval id to simulate the playback progress event,
     * stored to remove the interval whan player is cleared
     * @type {null}
     */
    fakeProgressListener = null;

    /**
     * Keep track of playback progress percentage, used to fire playback percentage events
     * @type {{'25': boolean, '50': boolean, '75': boolean}}
     */
    timeupdatePercentages = {
        25: false,
        50: false,
        75: false,
    };

    isPlayed = false;

    /**
     * Get video Muted status
     * @return {PromiseLike<boolean | never>}
     */
    get isMuted() {
        return this.ready.then(() => this.ytPlayer.isMuted());
    }

    /**
     * Return all the registered listeners grouped by their event
     */
    get listeners() {
        return this.internalListeners;
    }

    constructor(options, id) {
        this.id = id;

        this.ready = this.createYT(options.domNode,
            Object.assign({}, { videoId: options.videoId }, options.providerOptions || {}));
    }

    /**
     * Load the Youtube library if not loaded yet
     * If multiple instances of this provider exists in the same page,
     * only one library is loaded and shared between all instances
     */
    loadSDK() {
        if (!global.YTSDK) {
            if (typeof window.AYT === 'object' && typeof window.AYT.Player === 'function') {
                global.YTSDK = Promise.resolve(window.AYT.Player);
            } else {
                global.YTSDK = import(/* webpackChunkName: 'Youtube' */'youtube-player').then((mod) => {
                    window.AYT = {
                        Player: mod.default,
                    };
                    return window.AYT.Player;
                });
            }
        }
        return global.YTSDK;
    }

    /**
     * Create the Youtube Player in the given DOM Node with the given options
     * When the Player is ready, resolve the this.ready Promise
     * @param domNode
     * @param options
     * @return {Promise<any>}
     */
    createYT(domNode, options) {
        return new Promise((resolve, reject) => {
            this.loadSDK().then((Player) => {
                domNode = getDomNode(domNode);
                this.ytPlayer = Player(domNode, options);
                this.registerDefaultListeners();
                this.addProgressFakeListener();
                resolve();
            }).catch(err => reject(err));
        });
    }

    fireFirstPlay = () => {
        if (!this.isPlayed) {
            this.fireEvent('firstPlay');
            this.isPlayed = true;

            this.off('play', this.fireFirstPlay);
        }
    };

    /**
     * Register default listeners on Player init
     * Youtube player has only one event (stateChange),
     * we register a listener to that event
     * and call the internal listeners based on the event.data value (eventsNameMapping)
     */
    registerDefaultListeners() {
        this.ytPlayer.on('stateChange', (e) => {
            if (eventsNameMapping[e.data]) {
                this.fireEvent(eventsNameMapping[e.data], e);
            }
            if (e.data === 1) { // Play event
                this.fireFirstPlay();
            }
        });
    }

    /**
     * Given a percentage (one of the this.timeupdatePercentages keys)
     * check if the video playback reached that percentage of completion,
     * if yes, fire the playbackProgress% event
     * @param percentage
     * @param data
     */
    onPercentage(percentage, data) {
        if (Math.floor((data.total / 100) * percentage) === Math.floor(data.progress)) {
            if (!this.timeupdatePercentages[percentage]) {
                this.timeupdatePercentages[percentage] = true;
                this.fireEvent(`playbackProgress${percentage}`, data);
            }
        } else {
            this.timeupdatePercentages[percentage] = false;
        }
    }

    /**
     * Because of Youtube player lacks of playback progress event,
     * we simulate it with an interval every 250ms
     */
    addProgressFakeListener() {
        this.fakeProgressListener = setInterval(async () => {
            const total = await this.ytPlayer.getDuration();
            const progress = await this.ytPlayer.getCurrentTime();
            this.onPercentage(25, { total, progress });
            this.onPercentage(50, { total, progress });
            this.onPercentage(75, { total, progress });
        }, 250);
    }

    /**
     * Fire all listeners for a given event
     * if a fired listener is flagged as once,
     * immediately deregister it after its fire (fired only once)
     * @param evt
     * @param data
     */
    fireEvent(evt, ...data) {
        if (typeof this.internalListeners[evt] !== 'undefined') {
            this.internalListeners[evt].forEach((event) => {
                if (typeof event.callback === 'function') {
                    event.callback(...data);
                }
                if (event.once) {
                    this.off(evt, event.callback);
                }
            });
        }
    }

    /**
     * Add listener function to an event
     * Register the function in the internal this.internalListeners object
     * When the Youtube Player fires the stateChange event with the event associated State,
     * all listeners associated with the event will be called
     * @param event
     * @param cb
     * @param once
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    on(event, cb, once = false) {
        return this.ready.then(() => {
            if (typeof this.internalListeners[event] === 'undefined') {
                this.internalListeners[event] = [];
            }
            this.internalListeners[event].unshift({ callback: cb, once });
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
     * @param event
     * @param cb
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    off(event, cb) {
        return this.ready.then(() => {
            if (this.internalListeners[event]) {
                const index = this.internalListeners[event].findIndex(evt => evt.callback === cb);
                if (index > -1) {
                    this.internalListeners[event].splice(index, 1);
                }
            }
        });
    }

    /**
     * Remove the Youtube Player DOM Node
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    clear() {
        return this.ready.then(() => {
            clearInterval(this.fakeProgressListener);
            this.fakeProgressListener = null;
            return this.ytPlayer.destroy();
        });
    }

    /**
     * When Youtube Player is ready, send playVideo command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    play() {
        return this.ready.then(() => this.ytPlayer.playVideo());
    }

    /**
     * When Youtube Player is ready, send pauseVideo command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    pause() {
        return this.ready.then(() => this.ytPlayer.pauseVideo());
    }

    /**
     * When Youtube Player is ready, send stopVideo command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    stop() {
        return this.ready.then(() => {
            this.isPlayed = false;
            return this.ytPlayer.stopVideo();
        });
    }

    /**
     * When Youtube Player is ready, send mute command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    mute() {
        return this.ready.then(() => this.ytPlayer.mute());
    }

    /**
     * When Youtube Player is ready, send unMute command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    unmute() {
        return this.ready.then(() => this.ytPlayer.unMute());
    }

    /**
     * When Youtube Player is ready,
     * check if video is currently muted, if so, send the unMute command
     * else, send the mute command
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    toggleMute() {
        return this.ready.then(() => this.ytPlayer.isMuted())
            .then((bool) => {
                if (bool) {
                    return this.ytPlayer.unMute();
                }
                return this.ytPlayer.mute();
            });
    }

    /**
     * When Youtube Player is ready, send setVolume command
     * volumeLevel must be an number from 0 to 100
     * @param volumeLevel
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    setVolume(volumeLevel) {
        return this.ready.then(() => this.ytPlayer.setVolume(volumeLevel));
    }

    /**
     * When Youtube Player is ready, send command to seek to the current time plus the given seconds
     * @param seconds
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    forward(seconds) {
        return this.ready.then(() => this.ytPlayer.getCurrentTime())
            .then(current => this.ytPlayer.seekTo(current + seconds));
    }

    /**
     * When Youtube Player is ready,
     * send command to seek to the current time minus the given seconds
     * @param seconds
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    rewind(seconds) {
        return this.ready.then(() => this.ytPlayer.getCurrentTime())
            .then(current => this.ytPlayer.seekTo(current - seconds));
    }

    /**
     * When Youtube Player is ready, send command to seek to the given seconds
     * @param seconds
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    seek(seconds) {
        return this.ready.then(() => this.ytPlayer.seekTo(seconds));
    }

    /**
     * When Youtube Player is ready, send command to get the video url
     * @return {PromiseLike<T | never> | Promise<T | never>}
     */
    download() {
        return this.ready.then(() => this.ytPlayer.getVideoUrl());
    }
}

export default YoutubeProvider;
