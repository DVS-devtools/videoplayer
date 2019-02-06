import { getDomNode } from '../../lib';

const eventsNameMapping = {
    end: 'finish',
    playbackProgress: 'progress',
    firstPlay: 'firstplay'
};

class IframeProvider {
    id = null;

    iframeElement = null;

    iframeWindow = null;

    parent = null;

    ready = null;

    internalListeners = {};

    /**
     * Return all the registered internalListeners grouped by their event
     *
     */
    get listeners() {
        return this.internalListeners;
    }

    constructor(options, id) {
        this.id = id;
        this.ready = this.createIframe(options.domNode, options.url);
    }

    isThisIframe(source) {
        return this.iframeWindow === source;
    }

    createIframe(domNode, videoUrl) {
        return new Promise((resolve, reject) => {
            this.iframeElement = document.createElement('iframe');
            this.iframeElement.src = videoUrl;
            this.iframeElement.id = this.id;
            this.parent = getDomNode(domNode);
            this.parent.innerHtml = '';
            this.parent.appendChild(this.iframeElement);
            this.iframeWindow = this.iframeElement.contentWindow;

            window.addEventListener('message', (payload) => {
                try {
                    if (this.isThisIframe(payload.source)) {
                        const data = JSON.parse(payload.data);
                        if (data.event === 'ready') {
                            resolve(data);
                        } else {
                            this.handleIncomingMessage(data);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

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

    handleIncomingMessage(data) {
        this.fireEvent(data.event, data);
    }

    sendMessage(payload) {
        return this.ready.then(() => this.iframeWindow.postMessage(JSON.stringify(payload), '*'));
    }

    /**
     * Remove the Iframe DOM Node
     *
     * @return {Promise<void>}
     */
    clear() {
        return this.ready.then(() => {
            document.getElementById(this.id).remove();
            this.internalListeners = {};
        });
    }

    /**
     * Add listener function to an event
     * Register the function in the internal this.internalListeners object
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
            if (typeof this.internalListeners[eventName] === 'undefined') {
                this.internalListeners[eventName] = [];
            }
            this.internalListeners[eventName].unshift({ callback, once });
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
            }
        });
    }

    /**
     * When Iframe is ready, send play command
     * @return {Promise<any>}
     */
    play() {
        return this.sendMessage({ method: 'play' });
    }

    /**
     * When Iframe is ready, send pause command
     * @return {Promise<any>}
     */
    pause() {
        return this.sendMessage({ method: 'pause' });
    }

    /**
     * When Iframe is ready, send pause and seek to 0 command
     * @return {Promise<any>}
     */
    stop() {
        return this.sendMessage({ method: 'stop' });
    }

    /**
     * When Iframe is ready, send command to mute
     * @return {Promise<any>}
     */
    mute() {
        return this.sendMessage({ method: 'mute' });
    }

    /**
     * When Iframe is ready, send command to unmute
     * @return {Promise<any>}
     */
    unmute() {
        return this.sendMessage({ method: 'unmute' });
    }

    /**
     * When Iframe is ready, send command to toggle mute state
     * @return {Promise<any>}
     */
    toggleMute() {
        return this.sendMessage({ method: 'togglemute' });
    }

    togglePlay() {
        return this.sendMessage({ method: 'toggleplay' });
    }

    /**
     * When Iframe is ready, send command to toggle fullScreen state
     * @return {Promise<any>}
     */
    toggleFullScreen() {
        return this.sendMessage({ method: 'togglefullscreen' });
    }

    /**
     * When Iframe is ready, send command to set volume
     * volumeLevel can be a float from 0 to 1 or an integer from 0 to 100
     * @param volumeLevel
     * @return {Promise<any>}
     */
    setVolume(volumeLevel) {
        if (volumeLevel > 1) {
            volumeLevel /= 100;
        }
        return this.sendMessage({ method: 'setvolume', data: volumeLevel });
    }

    /**
     * When Iframe is ready, send command to seek to the current time plus the given seconds
     * @param seconds
     * @return {Promise<any>}
     */
    forward(seconds) {
        return this.sendMessage({ method: 'forward', data: seconds });
    }

    /**
     * When Iframe is ready, send command to seek to the current time minus the given seconds
     * @param seconds
     * @return {Promise<any>}
     */
    rewind(seconds) {
        return this.sendMessage({ method: 'rewind', data: seconds });
    }

    /**
     * When Iframe is ready, send command to seek to the given seconds
     * @param seconds
     * @return {Promise<any>}
     */
    seek(seconds) {
        return this.sendMessage({ method: 'seek', data: seconds });
    }

    /**
     * When Iframe is ready, send command to download the video
     * @return {Promise<any>}
     */
    download() {
        return this.sendMessage({ method: 'download' });
    }
}

export default IframeProvider;
