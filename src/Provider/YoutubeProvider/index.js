import getDomNode from '../../lib/getDomNode';
import Unsupported from '../../lib/unsupported';
import global from '../../global';

const eventsNameMapping = {
    0: 'end',
    1: 'play',
    2: 'pause',
    3: 'buffering',
};

@Unsupported('toggleFullScreen')
class YoutubeProvider {
    id = null;

    ytPlayer = null;

    listeners = {};

    ready = null;

    fakeProgressListener = null;

    timeupdatePercentages = {
        25: false,
        50: false,
        75: false,
    };

    get isMuted() {
        return this.ready.then(() => this.ytPlayer.isMuted());
    }

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
                this.registerDefaultListeners();
                this.addProgressFakeListener();
                resolve();
            }).catch(err => reject(err));
        });
    }

    registerDefaultListeners() {
        this.ytPlayer.on('stateChange', (e) => {
            if (eventsNameMapping[e.data]) {
                this.fireEvent(eventsNameMapping[e.data], e);
            }
        });
    }

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

    on(event, cb, once = false) {
        return this.ready.then(() => {
            if (typeof this.listeners[event] === 'undefined') {
                this.listeners[event] = [];
            }
            this.listeners[event].unshift({ callback: cb, once });
        });
    }

    one(event, cb) {
        return this.on(event, cb, true);
    }

    off(event, cb) {
        return this.ready.then(() => {
            if (this.listeners[event]) {
                const index = this.listeners[event].findIndex(evt => evt.callback === cb);
                if (index > -1) {
                    this.listeners[event].splice(index, 1);
                }
            }
        });
    }

    clear() {
        return this.ready.then(() => {
            clearInterval(this.fakeProgressListener);
            this.fakeProgressListener = null;
            return this.ytPlayer.destroy();
        });
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
