/**
 * @ignore
 */
export default class TestProvider {
    id = null;

    iframeElement = null;

    iframeDoc = null;

    iframeContentWindow = null;

    isMuted = false;

    isFullScreen = false;

    listeners = {};

    parent = null;

    /**
     *Creates an instance of TestProvider.
     * @param {Object} options
     * @param {String} id
     * @memberof TestProvider
     */
    constructor(options, id) {
        this.id = id;

        this.iframeElement = document.createElement('iframe');

        this.iframeElement.id = id;

        if (typeof options.domNode === 'string') {
            if (options.domNode.indexOf('#') === 0) {
                this.parent = document.querySelector(options.domNode);
                this.parent.appendChild(this.iframeElement);
            } else {
                this.parent = document.getElementById(options.domNode);
                this.parent.appendChild(this.iframeElement);
            }
        } else {
            this.parent = options.domNode;
            this.parent.appendChild(this.iframeElement);
        }


        this.iframeDoc = this.iframeElement.contentDocument
                         || this.iframeElement.contentWindow.document;

        this.iframeContentWindow = this.iframeElement.contentWindow;

        this.iframeDoc.open();
        this.iframeDoc.write('<html>'
        + '<body>'
        + '<video width="200" controls>'
        + '<source src="http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.mp4" type="video/mp4">'
        + '<source src="http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_60fps_normal.ogg" type="video/ogg">'
        + 'Your browser does not support HTML5 video.'
        + '</video>'
        + '</body>'
        + '</html>');

        this.iframeDoc.close();

        const [videoBBB] = this.iframeDoc.getElementsByTagName('video');

        this.iframeContentWindow.addEventListener('message', receivedMessage => {
            console.log([`iframe: ${id}`, 'received', receivedMessage]);

            const message = JSON.parse(receivedMessage.data);

            switch (message.command) {
            case 'play':
                videoBBB.play();

                this.fireEvent('play');
                break;
            case 'pause':
                videoBBB.pause();

                this.fireEvent('pause');
                break;
            case 'stop':
                videoBBB.pause();
                videoBBB.currentTime = 0;

                this.fireEvent('stop');
                break;
            case 'mute':
                videoBBB.muted = true;

                this.fireEvent('mute');
                break;
            case 'unmute':
                videoBBB.muted = false;

                this.fireEvent('unmute');
                break;
            case 'enterFullScreen':
                if (videoBBB.requestFullscreen) {
                    videoBBB.requestFullscreen();
                } else if (videoBBB.mozRequestFullScreen) {
                    videoBBB.mozRequestFullScreen();
                } else if (videoBBB.webkitRequestFullscreen) {
                    videoBBB.webkitRequestFullscreen();
                } else if (videoBBB.msRequestFullscreen) {
                    videoBBB.msRequestFullscreen();
                }

                this.fireEvent('enterFullScreen');
                break;
            case 'exitFullScreen':
                if (this.iframeDoc.mozCancelFullScreen) {
                    this.iframeDoc.mozCancelFullScreen();
                } else if (this.iframeDoc.webkitCancelFullScreen) {
                    this.iframeDoc.webkitCancelFullScreen();
                } else {
                    document.exitFullscreen();
                }

                this.fireEvent('exitFullScreen');
                break;
            case 'setVolume':
                videoBBB.volume = message.value;

                this.fireEvent('setVolume');
                break;
            case 'forward':
                videoBBB.currentTime += message.value;

                this.fireEvent('forward');
                break;
            case 'rewind':
                videoBBB.currentTime -= message.value;

                this.fireEvent('rewind');
                break;
            case 'seek':
                videoBBB.currentTime = message.value;

                this.fireEvent('seek');
                break;
            case 'destroy':
                this.parent.removeChild(this.iframeElement);

                this.fireEvent('destroy');
                break;
            default:
                console.log('unknown message', receivedMessage.data);
            }
        });

        this.on('destroy', () => {
            console.log(`player ${this.id} destroyed`);

            this.id = null;
            this.iframeDoc = null;
            this.iframeContentWindow = null;
            this.isMuted = false;
            this.isFullScreen = false;
            this.listeners = {};
            this.parent = null;
        });
    }

    fireEvent(evt) {
        if (typeof this.listeners[evt] !== 'undefined') {
            this.listeners[evt].forEach(callbackFunction => {
                callbackFunction();
            });
        }
    }

    on(event, cb) {
        if (typeof this.listeners[event] === 'undefined') {
            this.listeners[event] = [];
        }

        this.listeners[event].unshift(cb);

        return cb;
    }

    off(event, cb) {
        // TODO;
        console.log('off', event, cb);
        if (this.listeners[event] && this.listeners[event].indexOf(cb) > -1) {
            const index = this.listeners[event].indexOf(cb);
            this.listeners[event].splice(index, 1);
        }
    }

    getListeners(evt) {
        if (typeof evt === 'string') {
            if (typeof this.listeners[evt] !== 'undefined') {
                return this.listeners[evt];
            }

            return [];
        }

        return this.listeners;
    }

    play() {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'play' }), window.location.origin);
    }

    pause() {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'pause' }), window.location.origin);
    }

    stop() {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'stop' }), window.location.origin);
    }

    mute() {
        this.isMuted = true;
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'mute' }), window.location.origin);
    }

    unmute() {
        this.isMuted = false;
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'unmute' }), window.location.origin);
    }

    toggleMute() {
        if (this.isMuted) {
            this.isMuted = false;
            this.unmute();
        } else {
            this.isMuted = true;
            this.mute();
        }
    }

    toggleFullScreen() {
        if (this.isFullScreen) {
            this.isFullScreen = false;
            this.iframeContentWindow.postMessage(JSON.stringify({ command: 'exitFullScreen' }), window.location.origin);
        } else {
            this.isFullScreen = true;
            this.iframeContentWindow.postMessage(JSON.stringify({ command: 'enterFullScreen' }), window.location.origin);
        }
    }

    togglePlay() {
        //
    }

    download() {
        //
    }

    setVolume(volumeLevel) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'setVolume', value: volumeLevel }), window.location.origin);
    }

    forward(seconds) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'forward', value: seconds }), window.location.origin);
    }

    rewind(seconds) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'rewind', value: seconds }), window.location.origin);
    }

    seek(seconds) {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'seek', value: seconds }), window.location.origin);
    }

    clear() {
        this.iframeContentWindow.postMessage(JSON.stringify({ command: 'destroy' }), window.location.origin);
    }
}
