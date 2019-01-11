import getDomNode from '../../lib/getDomNode';
import Unsupported from '../../lib/unsupported';
import global from '../../global';

const eventsNameMapping = {
    end: ['onStateChange', 0],
    play: ['onStateChange', 1],
    pause: ['onStateChange', 2],
    buffering: ['onStateChange', 3]
};

@Unsupported('toggleFullScreen')
class YoutubeProvider {
    id = null;

    ytPlayer = null;

    listeners = {};

    ytListeners = {};

    ready = null;

    constructor(options, id) {
        this.id = id;

        this.ready = this.createYT(options.domNode,
            Object.assign({}, { videoId: options.videoId }, options.providerOptions || {}));
    }

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

    createYT(domNode, options) {
        return new Promise((resolve, reject) => {
            this.loadSDK().then((Player) => {
                domNode = getDomNode(domNode);
                this.ytPlayer = Player(domNode, options);
                resolve();
            }).catch(err => reject(err));
        });
    }

    /**
     * Create a callback function that fires all registered listeners for a given event
     * Store the callback in the this.ytListeners object
     * @param evt
     * @return {function(): void}
     */
    addVmListener(evt) {
        const cb = (...data) => this.fireEvent(evt, ...data);
        this.ytListeners[evt] = cb;
        return cb;
    }

    /**
     * Fire all listeners for a given event
     * if a fired listener is flagged as once,
     * immediately deregister it after its fire (fired only once)
     * @param evt
     * @param data
     */
    fireEvent(evt, ...data) {
        if (typeof this.listeners[evt] !== 'undefined') {
            this.listeners[evt].forEach((event) => {
                if (typeof event.callback === 'function') {
                    event.callback(...data);
                }
                if (event.once) {
                    this.off(evt, event.callback);
                }
            });
        }
    }

    on(event, cb) {
        return this.ready.then(() => {
            const eventName = eventsNameMapping[event];

        });
    }

    off(event, cb) {

    }

    clear() {
        return this.ready.then(() => this.ytPlayer.destroy());
    }

    play() {
        return this.ready.then(() => this.ytPlayer.playVideo());
    }

    pause() {
        return this.ready.then(() => this.ytPlayer.pauseVideo());
    }

    stop() {
        return this.ready.then(() => this.ytPlayer.stopVideo());
    }

    mute() {
        return this.ready.then(() => this.ytPlayer.mute());
    }

    unmute() {
        return this.ready.then(() => this.ytPlayer.unMute());
    }

    toggleMute() {
        return this.ready.then(() => this.ytPlayer.isMuted())
            .then((bool) => {
                if (bool) {
                    return this.ytPlayer.unMute();
                }
                return this.ytPlayer.mute();
            });
    }

    setVolume(volumeLevel) {
        return this.ready.then(() => this.ytPlayer.setVolume(volumeLevel));
    }

    forward(seconds) {
        return this.ready.then(() => this.ytPlayer.getCurrentTime())
            .then(current => this.ytPlayer.seekTo(current + seconds));
    }

    rewind(seconds) {
        return this.ready.then(() => this.ytPlayer.getCurrentTime())
            .then(current => this.ytPlayer.seekTo(current - seconds));
    }

    seek(seconds) {
        return this.ready.then(() => this.ytPlayer.seekTo(seconds));
    }

    download() {
        return this.ready.then(() => this.ytPlayer.getVideoUrl());
    }

    getListeners() {
        return this.listeners;
    }
}

export default YoutubeProvider;
