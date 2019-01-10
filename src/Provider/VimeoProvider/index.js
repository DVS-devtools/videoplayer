let VIMEOSDK = null;

const eventsNameMapping = {
    end: 'ended',
    playbackProgress: 'timeupdate',
    loadProgress: 'progress',
    seek: 'seeked',
    setVolume: 'volumechange',
    buffering: 'bufferstart',
};

const eventsToIgnore = [
    'playbackProgress25',
    'playbackProgress50',
    'playbackProgress75'
];


class VimeoProvider {
    id = null;

    ready = null;

    vmPlayer = null;

    listeners = {};

    vmListeners = {};

    constructor(options, id) {
        this.id = id;

        this.ready = this.createVM(options.domNode,
            Object.assign({ id: options.videoId }, options.providerOptions || {}));
    }

    loadSdk() {
        if (!VIMEOSDK) {
            if (typeof window.Vimeo === 'object' && typeof window.Vimeo.Player === 'function') {
                VIMEOSDK = Promise.resolve(window.Vimeo.Player);
            } else {
                VIMEOSDK = import('@vimeo/player').then((mod) => {
                    window.Vimeo = {
                        Player: mod.default,
                    };
                    return window.Vimeo.Player;
                });
            }
        }
        return VIMEOSDK;
    }

    createVM(node, options) {
        return new Promise((resolve) => {
            this.loadSdk().then((Player) => {
                this.vmPlayer = new Player(node, options);
                resolve();
            });
        });
    }

    addVmListener(evt) {
        const cb = (...data) => this.fireEvent(evt, ...data);
        this.vmListeners[evt] = cb;
        return cb;
    }

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

    clear() {
        return this.ready.then(() => {
            this.listeners = {};
            this.vmListeners = {};
            return this.vmPlayer.destroy();
        });
    }

    on(event, cb, once = false) {
        return this.ready.then(() => {
            const eventName = eventsNameMapping[event] || Object.values(eventsNameMapping).find(e => e === 'event') || event;
            if (typeof this.listeners[event] === 'undefined') {
                this.listeners[event] = [];
                if (!eventsToIgnore.includes(event)) {
                    this.vmPlayer.on(eventName, this.addVmListener(event));
                }
            }
            this.listeners[event].unshift({ callback: cb, once });
        });
    }

    off(event, cb) {
        return this.ready.then(() => {
            if (this.listeners[event]) {
                const index = this.listeners[event].findIndex(evt => evt.callback === cb);
                if (index > -1) {
                    this.listeners[event].splice(index, 1);
                }
                if (!this.listeners[event].length && this.vmListeners[event]) {
                    this.vmPlayer.off(event, this.vmListeners[event]);
                }
            }
        });
    }

    play() {
        return this.ready.then(() => this.vmPlayer.play());
    }

    pause() {
        return this.ready.then(() => this.vmPlayer.pause());
    }

    stop() {
        return this.ready.then(() => this.vmPlayer.unload());
    }

    mute() {
        return this.ready.then(() => this.vmPlayer.setVolume(0));
    }

    unmute() {
        return this.ready.then(() => this.vmPlayer.setVolume(1));
    }

    toggleMute() {
        return this.ready
            .then(() => this.vmPlayer.getVolume())
            .then(volume => this.vmPlayer.setVolume(volume > 0 ? 0 : 1));
    }

    setVolume(volumeLevel) {
        if (volumeLevel > 1) {
            volumeLevel /= 100;
        }
        return this.ready.then(() => this.vmPlayer.setVolume(volumeLevel));
    }

    forward(seconds) {
        return this.ready
            .then(() => this.vmPlayer.getCurrentTime())
            .then(current => this.vmPlayer.setCurrentTime(current + seconds));
    }

    rewind(seconds) {
        return this.ready
            .then(() => this.vmPlayer.getCurrentTime())
            .then(current => this.vmPlayer.setCurrentTime(current - seconds));
    }

    seek(seconds) {
        return this.ready.then(() => this.vmPlayer.setCurrentTime(seconds));
    }

    download() {
        return this.ready.then(() => this.vmPlayer.getVideoUrl());
    }

    getListeners() {
        return this.listeners;
    }
}

export default VimeoProvider;
